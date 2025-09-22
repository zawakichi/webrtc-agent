package entities

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

// MeetingStatus represents the status of a meeting
type MeetingStatus string

const (
	MeetingStatusWaiting   MeetingStatus = "waiting"
	MeetingStatusActive    MeetingStatus = "active"
	MeetingStatusEnded     MeetingStatus = "ended"
	MeetingStatusCancelled MeetingStatus = "cancelled"
)

// Meeting represents a Google Meet session
type Meeting struct {
	ID          uuid.UUID     `json:"id" gorm:"type:varchar(36);primaryKey"`
	URL         string        `json:"url" gorm:"type:varchar(500);uniqueIndex;not null"`
	Title       string        `json:"title" gorm:"type:varchar(255)"`
	Status      MeetingStatus `json:"status" gorm:"type:enum('waiting','active','ended','cancelled');default:'waiting';not null"`
	HostUserID  *uuid.UUID    `json:"host_user_id" gorm:"type:varchar(36);index"`
	CreatedAt   time.Time     `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time     `json:"updated_at" gorm:"autoUpdateTime"`
	StartedAt   *time.Time    `json:"started_at,omitempty"`
	EndedAt     *time.Time    `json:"ended_at,omitempty"`
	Participants []Participant `json:"participants,omitempty" gorm:"foreignKey:MeetingID"`
}

// NewMeeting creates a new meeting instance
func NewMeeting(url, title string, hostUserID *uuid.UUID) (*Meeting, error) {
	if url == "" {
		return nil, errors.New("meeting URL is required")
	}

	return &Meeting{
		ID:         uuid.New(),
		URL:        url,
		Title:      title,
		Status:     MeetingStatusWaiting,
		HostUserID: hostUserID,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}, nil
}

// Start marks the meeting as active
func (m *Meeting) Start() error {
	if m.Status != MeetingStatusWaiting {
		return errors.New("meeting can only be started from waiting status")
	}

	now := time.Now()
	m.Status = MeetingStatusActive
	m.StartedAt = &now
	m.UpdatedAt = now

	return nil
}

// End marks the meeting as ended
func (m *Meeting) End() error {
	if m.Status != MeetingStatusActive {
		return errors.New("meeting can only be ended from active status")
	}

	now := time.Now()
	m.Status = MeetingStatusEnded
	m.EndedAt = &now
	m.UpdatedAt = now

	return nil
}

// Cancel marks the meeting as cancelled
func (m *Meeting) Cancel() error {
	if m.Status == MeetingStatusEnded {
		return errors.New("cannot cancel an ended meeting")
	}

	now := time.Now()
	m.Status = MeetingStatusCancelled
	m.UpdatedAt = now

	return nil
}

// IsActive returns true if the meeting is currently active
func (m *Meeting) IsActive() bool {
	return m.Status == MeetingStatusActive
}

// GetDuration returns the duration of the meeting if it has ended
func (m *Meeting) GetDuration() time.Duration {
	if m.StartedAt == nil {
		return 0
	}

	if m.EndedAt != nil {
		return m.EndedAt.Sub(*m.StartedAt)
	}

	if m.Status == MeetingStatusActive {
		return time.Since(*m.StartedAt)
	}

	return 0
}

// AddParticipant adds a participant to the meeting
func (m *Meeting) AddParticipant(participant *Participant) error {
	if m.Status != MeetingStatusActive {
		return errors.New("can only add participants to active meetings")
	}

	participant.MeetingID = m.ID
	participant.JoinedAt = time.Now()
	participant.IsActive = true

	m.Participants = append(m.Participants, *participant)
	m.UpdatedAt = time.Now()

	return nil
}

// RemoveParticipant removes a participant from the meeting
func (m *Meeting) RemoveParticipant(participantID uuid.UUID) error {
	for i, p := range m.Participants {
		if p.ID == participantID {
			now := time.Now()
			m.Participants[i].IsActive = false
			m.Participants[i].LeftAt = &now
			m.UpdatedAt = now
			return nil
		}
	}

	return errors.New("participant not found")
}

// GetActiveParticipants returns all active participants
func (m *Meeting) GetActiveParticipants() []Participant {
	var active []Participant
	for _, p := range m.Participants {
		if p.IsActive {
			active = append(active, p)
		}
	}
	return active
}