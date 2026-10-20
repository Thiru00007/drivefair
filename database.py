"""SQLite persistence for DriveFair."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Iterator

from scoring import score_trip

DEFAULT_DB_PATH = Path(os.environ.get("DRIVEFAIR_DB_PATH", "data/drivefair.db"))
KM_PER_MILE = 1.60934
PASSWORD_ITERATIONS = 310_000
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

SAMPLE_TRIPS = [
    {
        "origin": "Home, Velachery",
        "destination": "Office, Guindy",
        "date": "2026-10-20T08:42:00",
        "miles": 7.5 / KM_PER_MILE,
        "duration": "28 min",
        "signals": {},
        "event": "",
    },
    {
        "origin": "Guindy",
        "destination": "T. Nagar",
        "date": "2026-10-19T18:18:00",
        "miles": 5.0 / KM_PER_MILE,
        "duration": "31 min",
        "signals": {"hard_brakes": 1},
        "event": "Hard braking",
    },
    {
        "origin": "Velachery",
        "destination": "Marina Beach",
        "date": "2026-10-18T10:05:00",
        "miles": 12.0 / KM_PER_MILE,
        "duration": "34 min",
        "signals": {},
        "event": "",
    },
    {
        "origin": "Adyar",
        "destination": "Velachery",
        "date": "2026-10-17T21:36:00",
        "miles": 14.0 / KM_PER_MILE,
        "duration": "39 min",
        "signals": {"night_driving": True},
        "event": "",
    },
]


def utc_now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def password_digest(password: str, salt: bytes | None = None) -> str:
    """Hash a password with PBKDF2 and a unique salt."""
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS
    )
    return (
        f"pbkdf2_sha256${PASSWORD_ITERATIONS}$"
        f"{base64.b64encode(salt).decode('ascii')}$"
        f"{base64.b64encode(digest).decode('ascii')}"
    )


def verify_password(password: str, stored_digest: str) -> bool:
    """Safely compare a password with its stored hash."""
    if len(password) > 1024:
        return False
    try:
        algorithm, iterations_text, salt_text, digest_text = stored_digest.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_text)
        if iterations < 100_000 or iterations > 2_000_000:
            return False
        salt = base64.b64decode(salt_text, validate=True)
        expected = base64.b64decode(digest_text, validate=True)
    except (ValueError, TypeError):
        return False
    actual = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, iterations
    )
    return hmac.compare_digest(actual, expected)


class DriveFairDatabase:
    """Small SQLite repository; every read and write is scoped to an account."""

    def __init__(self, path: str | Path = DEFAULT_DB_PATH) -> None:
        self.path = str(path)
        if self.path != ":memory:":
            Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        self.initialize()

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        connection = sqlite3.connect(self.path, timeout=15)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        try:
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def initialize(self) -> None:
        with self.connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    password_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS preferences (
                    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                    theme TEXT NOT NULL DEFAULT 'light' CHECK(theme IN ('light', 'dark')),
                    plan TEXT NOT NULL DEFAULT 'mile' CHECK(plan IN ('mile', 'journey', 'monthly')),
                    language TEXT NOT NULL DEFAULT 'English' CHECK(language IN ('English', 'हिन्दी')),
                    tracking INTEGER NOT NULL DEFAULT 1 CHECK(tracking IN (0, 1)),
                    precise_locations INTEGER NOT NULL DEFAULT 1 CHECK(precise_locations IN (0, 1)),
                    incident_assistance INTEGER NOT NULL DEFAULT 1 CHECK(incident_assistance IN (0, 1)),
                    historic_miles REAL NOT NULL DEFAULT 310.686,
                    historic_trips INTEGER NOT NULL DEFAULT 20,
                    historic_events INTEGER NOT NULL DEFAULT 1
                );
                CREATE TABLE IF NOT EXISTS trips (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    origin TEXT NOT NULL,
                    destination TEXT NOT NULL,
                    started_at TEXT NOT NULL,
                    miles REAL NOT NULL CHECK(miles >= 0),
                    duration TEXT NOT NULL,
                    score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
                    event TEXT NOT NULL DEFAULT '',
                    signals_json TEXT NOT NULL DEFAULT '{}',
                    is_sample INTEGER NOT NULL DEFAULT 0 CHECK(is_sample IN (0, 1)),
                    created_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS trips_user_date ON trips(user_id, started_at DESC);
                CREATE TABLE IF NOT EXISTS claims (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    claim_ref TEXT NOT NULL UNIQUE,
                    incident_date TEXT NOT NULL,
                    incident_type TEXT NOT NULL,
                    description TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Submitted')),
                    trip_summary_json TEXT,
                    created_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS claims_user_date ON claims(user_id, created_at DESC);
                """
            )
            preference_columns = {
                row["name"]
                for row in connection.execute("PRAGMA table_info(preferences)").fetchall()
            }
            if "language" not in preference_columns:
                connection.execute(
                    "ALTER TABLE preferences ADD COLUMN language TEXT NOT NULL "
                    "DEFAULT 'English' CHECK(language IN ('English', 'हिन्दी'))"
                )

    def create_user(self, email: str, password: str) -> int:
        normalized_email = email.strip().lower()
        if not EMAIL_PATTERN.fullmatch(normalized_email):
            raise ValueError("Enter a valid email address.")
        if len(password) < 12:
            raise ValueError("Use a password with at least 12 characters.")
        if len(password) > 1024:
            raise ValueError("Password must be 1024 characters or fewer.")

        with self.connect() as connection:
            try:
                cursor = connection.execute(
                    "INSERT INTO users(email, password_hash, created_at) VALUES (?, ?, ?)",
                    (normalized_email, password_digest(password), utc_now()),
                )
            except sqlite3.IntegrityError as error:
                raise ValueError("An account with that email already exists.") from error
            user_id = int(cursor.lastrowid)
            connection.execute("INSERT INTO preferences(user_id) VALUES (?)", (user_id,))
            self._insert_sample_trips(connection, user_id)
            return user_id

    def authenticate(self, email: str, password: str) -> dict[str, Any] | None:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT id, email, password_hash FROM users WHERE email = ? COLLATE NOCASE",
                (email.strip(),),
            ).fetchone()
        if row is None or not verify_password(password, row["password_hash"]):
            return None
        return {"id": int(row["id"]), "email": str(row["email"])}

    def _insert_sample_trips(self, connection: sqlite3.Connection, user_id: int) -> None:
        now = utc_now()
        for trip in SAMPLE_TRIPS:
            signals = trip["signals"]
            connection.execute(
                """
                INSERT INTO trips(
                    user_id, origin, destination, started_at, miles, duration,
                    score, event, signals_json, is_sample, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (
                    user_id,
                    trip["origin"],
                    trip["destination"],
                    trip["date"],
                    trip["miles"],
                    trip["duration"],
                    score_trip(signals),
                    trip["event"],
                    json.dumps(signals),
                    now,
                ),
            )

    def get_preferences(self, user_id: int) -> dict[str, Any]:
        with self.connect() as connection:
            row = connection.execute(
                "SELECT * FROM preferences WHERE user_id = ?", (user_id,)
            ).fetchone()
        if row is None:
            raise ValueError("Account preferences are missing.")
        result = dict(row)
        for key in ("tracking", "precise_locations", "incident_assistance"):
            result[key] = bool(result[key])
        return result

    def update_preferences(self, user_id: int, **values: object) -> None:
        allowed = {
            "theme": ("light", "dark"),
            "plan": ("mile", "journey", "monthly"),
            "language": ("English", "हिन्दी"),
            "tracking": (True, False),
            "precise_locations": (True, False),
            "incident_assistance": (True, False),
        }
        updates = {key: value for key, value in values.items() if key in allowed}
        if not updates:
            return
        for key, value in updates.items():
            if value not in allowed[key]:
                raise ValueError(f"Invalid {key} preference.")
        columns = ", ".join(f"{key} = ?" for key in updates)
        parameters = tuple(
            int(value) if isinstance(value, bool) else value for value in updates.values()
        )
        with self.connect() as connection:
            cursor = connection.execute(
                f"UPDATE preferences SET {columns} WHERE user_id = ?",
                (*parameters, user_id),
            )
            if cursor.rowcount != 1:
                raise ValueError("Account preferences are missing.")

    def list_trips(self, user_id: int) -> list[dict[str, Any]]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM trips WHERE user_id = ? ORDER BY started_at DESC, id DESC",
                (user_id,),
            ).fetchall()
        trips = []
        for row in rows:
            trip = dict(row)
            trip["signals"] = json.loads(trip.pop("signals_json"))
            trip["miles"] = float(trip["miles"])
            trips.append(trip)
        return trips

    def add_trip(
        self,
        user_id: int,
        *,
        origin: str,
        destination: str,
        started_at: str,
        miles: float,
        duration: str,
        signals: dict[str, object],
        event: str = "",
    ) -> int:
        if not origin.strip() or not destination.strip():
            raise ValueError("Origin and destination are required.")
        if not 0 < miles <= 1_000:
            raise ValueError("Trip distance must be between 0 and 1,000 kilometres.")
        score = score_trip(signals)
        with self.connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO trips(
                    user_id, origin, destination, started_at, miles, duration,
                    score, event, signals_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    origin.strip()[:120],
                    destination.strip()[:120],
                    started_at,
                    round(miles, 2),
                    duration[:40],
                    score,
                    event[:80],
                    json.dumps(signals),
                    utc_now(),
                ),
            )
            return int(cursor.lastrowid)

    def monthly_totals(self, user_id: int) -> dict[str, float | int]:
        preferences = self.get_preferences(user_id)
        with self.connect() as connection:
            row = connection.execute(
                """
                SELECT COALESCE(SUM(miles), 0) AS trip_miles,
                       COUNT(*) AS trip_count,
                       SUM(CASE WHEN event != '' THEN 1 ELSE 0 END) AS event_count
                FROM trips WHERE user_id = ?
                """,
                (user_id,),
            ).fetchone()
            trip_count = int(row["trip_count"] or 0)
            return {
                "miles": round(float(preferences["historic_miles"]) + float(row["trip_miles"]), 1),
                "trip_count": int(preferences["historic_trips"]) + trip_count,
                "event_count": int(preferences["historic_events"]) + int(row["event_count"] or 0),
            }

    def create_claim(
        self,
        user_id: int,
        *,
        incident_date: str,
        incident_type: str,
        description: str,
        trip_summary: dict[str, Any] | None,
    ) -> str:
        normalized_description = description.strip()
        if not normalized_description:
            raise ValueError("Add a brief description before saving the draft.")
        if len(normalized_description) > 1_000:
            raise ValueError("Description must be 1,000 characters or fewer.")
        if incident_type not in {
            "Collision",
            "Vehicle damage",
            "Theft or break-in",
            "Other",
        }:
            raise ValueError("Choose a valid incident type.")
        with self.connect() as connection:
            for _attempt in range(3):
                claim_ref = f"DF-{secrets.token_hex(4).upper()}"
                try:
                    connection.execute(
                        """
                        INSERT INTO claims(
                            user_id, claim_ref, incident_date, incident_type,
                            description, trip_summary_json, created_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            user_id,
                            claim_ref,
                            incident_date,
                            incident_type,
                            normalized_description,
                            json.dumps(trip_summary) if trip_summary else None,
                            utc_now(),
                        ),
                    )
                    return claim_ref
                except sqlite3.IntegrityError:
                    continue
        raise RuntimeError("Could not allocate a unique claim reference.")

    def list_claims(self, user_id: int) -> list[dict[str, Any]]:
        with self.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM claims WHERE user_id = ? ORDER BY created_at DESC, id DESC",
                (user_id,),
            ).fetchall()
        claims = []
        for row in rows:
            claim = dict(row)
            summary = claim.pop("trip_summary_json")
            claim["trip_summary"] = json.loads(summary) if summary else None
            claims.append(claim)
        return claims

    def export_user_data(self, user_id: int) -> dict[str, Any]:
        with self.connect() as connection:
            user = connection.execute(
                "SELECT email, created_at FROM users WHERE id = ?", (user_id,)
            ).fetchone()
        if user is None:
            raise ValueError("Account not found.")
        return {
            "exported_at": utc_now(),
            "notice": "DriveFair demo data; not an insurance record.",
            "profile": dict(user),
            "preferences": self.get_preferences(user_id),
            "trips": self.list_trips(user_id),
            "claims": self.list_claims(user_id),
        }

    def clear_user_demo_data(self, user_id: int) -> None:
        with self.connect() as connection:
            connection.execute("DELETE FROM trips WHERE user_id = ?", (user_id,))
            connection.execute("DELETE FROM claims WHERE user_id = ?", (user_id,))
            connection.execute(
                """
                UPDATE preferences
                SET theme = 'light', plan = 'mile', tracking = 1,
                    precise_locations = 1, incident_assistance = 1,
                    language = 'English', historic_miles = 310.686, historic_trips = 20,
                    historic_events = 1
                WHERE user_id = ?
                """,
                (user_id,),
            )
            self._insert_sample_trips(connection, user_id)
