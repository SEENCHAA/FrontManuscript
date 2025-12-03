package ds

import (
	"lab31/internal/app/role"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
)

// User - Пользователь
type User struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	Username string    `gorm:"unique;not null" json:"username"`
	Password string    `gorm:"not null" json:"password"`
	Role     role.Role `gorm:"type:integer;not null;default:0" json:"role"`
}

// JWTClaims - Данные внутри токена
type JWTClaims struct {
	jwt.RegisteredClaims
	UserID   uint      `json:"user_id"`
	UserUUID uuid.UUID `json:"user_uuid"`
	Role     role.Role `json:"role"`
}

// Letter - Услуга (Буква)
// internal/app/ds/models.go

type Letter struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Name        string `gorm:"unique;not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`

	PeriodStart int `gorm:"not null" json:"period_start"`
	PeriodEnd   int `gorm:"not null" json:"period_end"`

	// НОВОЕ ПОЛЕ (Pi)
	DurationDays int `gorm:"default:1" json:"duration_days"`

	Details  string `gorm:"type:text" json:"details"`
	ImageURL string `json:"image_url"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}

// Manuscript - Заявка
type Manuscript struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	UserID           uint       `gorm:"not null" json:"user_id"`
	Status           string     `gorm:"type:varchar(20);not null;default:'draft'" json:"status"`
	CreatedAt        time.Time  `gorm:"autoCreateTime" json:"created_at"`
	SubmittedAt      *time.Time `json:"submitted_at"`
	FinishedAt       *time.Time `json:"finished_at"`
	ModeratorID      *uint      `json:"moderator_id"`
	CalculatedPeriod string     `gorm:"type:varchar(50)" json:"calculated_period"`
	ManuscriptText   string     `gorm:"type:text" json:"manuscript_text"`

	// Связи
	User      User `gorm:"foreignKey:UserID" json:"user"`
	Moderator User `gorm:"foreignKey:ModeratorID" json:"moderator"`

	// ВАЖНО: json:"letters" (с маленькой), чтобы фронт увидел массив
	Letters []ManuscriptLetter `gorm:"foreignKey:ManuscriptID" json:"letters"`
}

// ManuscriptLetter - Связь M2M (Элемент корзины)
type ManuscriptLetter struct {
	ManuscriptID uint `gorm:"primaryKey" json:"manuscript_id"`
	LetterID     uint `gorm:"primaryKey" json:"letter_id"`
	Quantity     int  `gorm:"not null;default:1" json:"quantity"`

	// json:"-" означает не отправлять поле Manuscript обратно, чтобы не было бесконечного цикла
	Manuscript Manuscript `gorm:"foreignKey:ManuscriptID" json:"-"`

	// ВАЖНО: json:"letter" чтобы получить название и картинку внутри корзины
	Letter Letter `gorm:"foreignKey:LetterID" json:"letter"`
}
