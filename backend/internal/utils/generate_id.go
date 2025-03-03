package utils

import (
	"time"

	"github.com/sony/sonyflake"
)

var sf *sonyflake.Sonyflake

func init() {
	settings := sonyflake.Settings{
		StartTime: time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
	}
	sf = sonyflake.NewSonyflake(settings)
}

func GenerateID() (uint64, error) {
	id, err := sf.NextID()
	if err != nil {
		return 0, err
	}

	return id, nil
}
