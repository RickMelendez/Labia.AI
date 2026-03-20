"""
Lobby and LobbyMember Entities - Group Discovery Feature
"""
from datetime import datetime, timezone
from typing import Optional
from enum import Enum


class ActivityType(str, Enum):
    DATE_NIGHT = "date_night"
    ROAD_TRIP = "road_trip"
    BRUNCH = "brunch"
    ADVENTURE = "adventure"
    BEACH = "beach"
    CONCERT = "concert"
    HIKING = "hiking"
    CHILL = "chill"


class LobbyStatus(str, Enum):
    OPEN = "open"
    FULL = "full"
    STARTED = "started"
    EXPIRED = "expired"


class Lobby:
    """Lobby domain entity — an activity-anchored group discovery room."""

    MAX_CAPACITY = 10
    MIN_CAPACITY = 2

    def __init__(
        self,
        creator_id: int,
        name: str,
        activity_type: ActivityType,
        description: str,
        max_size: int,
        expires_at: datetime,
        lobby_id: Optional[int] = None,
        member_count: int = 0,
        status: LobbyStatus = LobbyStatus.OPEN,
        location_hint: Optional[str] = None,
        time_window_hint: Optional[str] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = lobby_id
        self.creator_id = creator_id
        self.name = name
        self.activity_type = activity_type
        self.description = description
        self.max_size = max(self.MIN_CAPACITY, min(self.MAX_CAPACITY, max_size))
        self.member_count = member_count
        self.status = status
        self.expires_at = expires_at
        self.location_hint = location_hint
        self.time_window_hint = time_window_hint
        self.created_at = created_at or datetime.now(timezone.utc)

    def is_joinable(self) -> bool:
        """Returns True if the lobby can accept new members."""
        return (
            self.status == LobbyStatus.OPEN
            and self.member_count < self.max_size
            and not self.is_expired()
        )

    def is_expired(self) -> bool:
        """Returns True if the lobby's expiry time has passed."""
        now = datetime.now(timezone.utc)
        expires = self.expires_at
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        return now > expires

    def energy_level(self) -> str:
        """Returns a human-friendly energy descriptor based on occupancy."""
        if self.member_count == 0:
            return "empty"
        ratio = self.member_count / self.max_size
        if ratio < 0.4:
            return "warm"
        if ratio < 0.85:
            return "buzzing"
        return "full"

    def spots_left(self) -> int:
        return max(0, self.max_size - self.member_count)
