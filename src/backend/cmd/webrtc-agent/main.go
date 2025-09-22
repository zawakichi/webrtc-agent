package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/fx"
	"go.uber.org/zap"

	"github.com/zawakichi/webrtc-agent/internal/application/services"
	"github.com/zawakichi/webrtc-agent/internal/application/usecases"
	"github.com/zawakichi/webrtc-agent/internal/infrastructure/config"
	"github.com/zawakichi/webrtc-agent/internal/infrastructure/database"
	"github.com/zawakichi/webrtc-agent/internal/infrastructure/repositories"
	"github.com/zawakichi/webrtc-agent/internal/infrastructure/webrtc"
	"github.com/zawakichi/webrtc-agent/internal/interfaces/controllers"
	"github.com/zawakichi/webrtc-agent/internal/interfaces/middlewares"
	"github.com/zawakichi/webrtc-agent/internal/interfaces/routes"
	"github.com/zawakichi/webrtc-agent/internal/interfaces/websocket"
)

var (
	configPath = flag.String("config", "configs/config.yaml", "Path to configuration file")
	envFile    = flag.String("env", ".env", "Path to .env file")
)

func main() {
	flag.Parse()

	// Load environment variables
	if err := godotenv.Load(*envFile); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}

	// Initialize logger
	logger, err := zap.NewProduction()
	if err != nil {
		log.Fatal("Failed to initialize logger:", err)
	}
	defer logger.Sync()

	// Create Fx application
	app := fx.New(
		// Provide logger
		fx.Provide(func() *zap.Logger { return logger }),

		// Provide configuration
		fx.Provide(func() (*config.Config, error) {
			return config.Load(*configPath)
		}),

		// Infrastructure layer
		fx.Provide(database.NewConnection),
		fx.Provide(repositories.NewMeetingRepository),
		fx.Provide(repositories.NewConsultationRepository),
		fx.Provide(repositories.NewRequirementRepository),
		fx.Provide(webrtc.NewManager),

		// Application layer
		fx.Provide(services.NewAuthService),
		fx.Provide(services.NewDocumentService),
		fx.Provide(usecases.NewJoinMeetingUseCase),
		fx.Provide(usecases.NewConsultationUseCase),
		fx.Provide(usecases.NewGenerateDocumentUseCase),

		// Interface layer
		fx.Provide(controllers.NewMeetingController),
		fx.Provide(controllers.NewConsultationController),
		fx.Provide(controllers.NewDocumentController),
		fx.Provide(websocket.NewConsultationHub),
		fx.Provide(middlewares.NewAuthMiddleware),
		fx.Provide(middlewares.NewLoggingMiddleware),

		// HTTP server
		fx.Provide(func(
			cfg *config.Config,
			meetingCtrl *controllers.MeetingController,
			consultationCtrl *controllers.ConsultationController,
			documentCtrl *controllers.DocumentController,
			wsHub *websocket.ConsultationHub,
			authMw *middlewares.AuthMiddleware,
			loggingMw *middlewares.LoggingMiddleware,
		) *gin.Engine {
			if cfg.Server.Mode == "production" {
				gin.SetMode(gin.ReleaseMode)
			}

			router := gin.New()
			router.Use(gin.Recovery())
			router.Use(loggingMw.Logger())

			// Setup routes
			routes.SetupMeetingRoutes(router, meetingCtrl, authMw)
			routes.SetupConsultationRoutes(router, consultationCtrl, authMw)
			routes.SetupDocumentRoutes(router, documentCtrl, authMw)
			routes.SetupWebSocketRoutes(router, wsHub)

			return router
		}),

		// Start the application
		fx.Invoke(startServer),
	)

	// Start the application
	ctx := context.Background()
	if err := app.Start(ctx); err != nil {
		logger.Fatal("Failed to start application", zap.Error(err))
	}

	// Wait for interrupt signal
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	// Graceful shutdown
	logger.Info("Shutting down server...")
	stopCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := app.Stop(stopCtx); err != nil {
		logger.Fatal("Failed to stop application", zap.Error(err))
	}

	logger.Info("Server stopped")
}

func startServer(lc fx.Lifecycle, cfg *config.Config, router *gin.Engine, logger *zap.Logger) {
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  time.Duration(cfg.Server.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.Server.WriteTimeout) * time.Second,
		IdleTimeout:  time.Duration(cfg.Server.IdleTimeout) * time.Second,
	}

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			logger.Info("Starting HTTP server", zap.Int("port", cfg.Server.Port))
			go func() {
				if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
					logger.Fatal("Failed to start server", zap.Error(err))
				}
			}()
			return nil
		},
		OnStop: func(ctx context.Context) error {
			logger.Info("Stopping HTTP server")
			return server.Shutdown(ctx)
		},
	})
}