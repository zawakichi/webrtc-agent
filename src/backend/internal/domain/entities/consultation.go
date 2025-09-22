package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// SessionStatus represents the status of a consultation session
type SessionStatus string

const (
	SessionStatusInitializing SessionStatus = "initializing"
	SessionStatusActive       SessionStatus = "active"
	SessionStatusPaused       SessionStatus = "paused"
	SessionStatusCompleted    SessionStatus = "completed"
	SessionStatusFailed       SessionStatus = "failed"
)

// SessionType represents the type of consultation
type SessionType string

const (
	SessionTypeDevelopmentConsultation SessionType = "development_consultation"
	SessionTypeArchitectureReview      SessionType = "architecture_review"
	SessionTypeTechnicalInterview      SessionType = "technical_interview"
)

// ConsultationSession represents a consultation session
type ConsultationSession struct {
	ID           uuid.UUID     `json:"id" gorm:"type:varchar(36);primaryKey"`
	MeetingID    uuid.UUID     `json:"meeting_id" gorm:"type:varchar(36);not null;index"`
	AgentID      uuid.UUID     `json:"agent_id" gorm:"type:varchar(36);not null;index"`
	Status       SessionStatus `json:"status" gorm:"type:enum('initializing','active','paused','completed','failed');default:'initializing';not null"`
	SessionType  SessionType   `json:"session_type" gorm:"type:varchar(50);default:'development_consultation';not null"`
	CreatedAt    time.Time     `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time     `json:"updated_at" gorm:"autoUpdateTime"`
	CompletedAt  *time.Time    `json:"completed_at,omitempty"`
	Meeting      *Meeting      `json:"meeting,omitempty" gorm:"foreignKey:MeetingID"`
	Agent        *Agent        `json:"agent,omitempty" gorm:"foreignKey:AgentID"`
	Conversations []Conversation `json:"conversations,omitempty" gorm:"foreignKey:SessionID"`
	Requirements []Requirement  `json:"requirements,omitempty" gorm:"foreignKey:SessionID"`
	Documents    []GeneratedDocument `json:"documents,omitempty" gorm:"foreignKey:SessionID"`
}

// NewConsultationSession creates a new consultation session
func NewConsultationSession(meetingID, agentID uuid.UUID, sessionType SessionType) (*ConsultationSession, error) {
	if meetingID == uuid.Nil {
		return nil, errors.New("meeting ID is required")
	}
	if agentID == uuid.Nil {
		return nil, errors.New("agent ID is required")
	}

	return &ConsultationSession{
		ID:          uuid.New(),
		MeetingID:   meetingID,
		AgentID:     agentID,
		Status:      SessionStatusInitializing,
		SessionType: sessionType,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}, nil
}

// Start activates the consultation session
func (cs *ConsultationSession) Start() error {
	if cs.Status != SessionStatusInitializing {
		return errors.New("session can only be started from initializing status")
	}

	cs.Status = SessionStatusActive
	cs.UpdatedAt = time.Now()

	return nil
}

// Pause pauses the consultation session
func (cs *ConsultationSession) Pause() error {
	if cs.Status != SessionStatusActive {
		return errors.New("session can only be paused from active status")
	}

	cs.Status = SessionStatusPaused
	cs.UpdatedAt = time.Now()

	return nil
}

// Resume resumes the consultation session
func (cs *ConsultationSession) Resume() error {
	if cs.Status != SessionStatusPaused {
		return errors.New("session can only be resumed from paused status")
	}

	cs.Status = SessionStatusActive
	cs.UpdatedAt = time.Now()

	return nil
}

// Complete marks the consultation session as completed
func (cs *ConsultationSession) Complete() error {
	if cs.Status != SessionStatusActive {
		return errors.New("session can only be completed from active status")
	}

	now := time.Now()
	cs.Status = SessionStatusCompleted
	cs.CompletedAt = &now
	cs.UpdatedAt = now

	return nil
}

// Fail marks the consultation session as failed
func (cs *ConsultationSession) Fail() error {
	cs.Status = SessionStatusFailed
	cs.UpdatedAt = time.Now()

	return nil
}

// IsActive returns true if the session is currently active
func (cs *ConsultationSession) IsActive() bool {
	return cs.Status == SessionStatusActive
}

// GetDuration returns the duration of the session
func (cs *ConsultationSession) GetDuration() time.Duration {
	if cs.CompletedAt != nil {
		return cs.CompletedAt.Sub(cs.CreatedAt)
	}

	if cs.Status == SessionStatusActive || cs.Status == SessionStatusPaused {
		return time.Since(cs.CreatedAt)
	}

	return 0
}

// AddConversation adds a conversation to the session
func (cs *ConsultationSession) AddConversation(conversation *Conversation) error {
	if !cs.IsActive() {
		return errors.New("can only add conversations to active sessions")
	}

	conversation.SessionID = cs.ID
	conversation.Timestamp = time.Now()
	conversation.SequenceNumber = len(cs.Conversations) + 1

	cs.Conversations = append(cs.Conversations, *conversation)
	cs.UpdatedAt = time.Now()

	return nil
}

// AddRequirement adds a requirement to the session
func (cs *ConsultationSession) AddRequirement(requirement *Requirement) error {
	requirement.SessionID = cs.ID
	requirement.CreatedAt = time.Now()
	requirement.UpdatedAt = time.Now()

	cs.Requirements = append(cs.Requirements, *requirement)
	cs.UpdatedAt = time.Now()

	return nil
}

// GetRequirementsByCategory returns requirements filtered by category
func (cs *ConsultationSession) GetRequirementsByCategory(category string) []Requirement {
	var filtered []Requirement
	for _, req := range cs.Requirements {
		if req.Category == category {
			filtered = append(filtered, req)
		}
	}
	return filtered
}

// GetRequirementsByPriority returns requirements filtered by priority
func (cs *ConsultationSession) GetRequirementsByPriority(priority RequirementPriority) []Requirement {
	var filtered []Requirement
	for _, req := range cs.Requirements {
		if req.Priority == priority {
			filtered = append(filtered, req)
		}
	}
	return filtered
}

// GetLatestConversations returns the latest N conversations
func (cs *ConsultationSession) GetLatestConversations(limit int) []Conversation {
	if len(cs.Conversations) <= limit {
		return cs.Conversations
	}

	start := len(cs.Conversations) - limit
	return cs.Conversations[start:]
}