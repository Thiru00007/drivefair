import tempfile
import unittest
from pathlib import Path

from database import DriveFairDatabase
from scoring import average_score, estimate_premium, score_trip


class ScoringTests(unittest.TestCase):
    def test_score_penalties_are_bounded_and_explainable(self) -> None:
        self.assertEqual(score_trip({}), 95)
        self.assertEqual(score_trip({"hard_brakes": 1}), 79)
        self.assertEqual(score_trip({"night_driving": True}), 91)
        self.assertEqual(score_trip({"hard_brakes": 10}), 0)

    def test_invalid_signal_counts_are_rejected(self) -> None:
        with self.assertRaises(ValueError):
            score_trip({"hard_brakes": -1})
        with self.assertRaises(ValueError):
            score_trip({"rapid_acceleration": True})

    def test_premium_line_items_sum_to_total(self) -> None:
        estimate = estimate_premium("mile", 386, 24, 90)
        self.assertEqual(estimate["total"], 64.02)
        self.assertEqual(estimate["score_adjustment"], -0.75)
        self.assertAlmostEqual(
            estimate["base"] + estimate["usage"] + estimate["score_adjustment"] - estimate["reward"],
            estimate["total"],
        )

    def test_average_score_has_safe_empty_default(self) -> None:
        self.assertEqual(average_score([]), 95)


class DatabaseTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.db = DriveFairDatabase(Path(self.temp_dir.name) / "test.db")
        self.user_id = self.db.create_user("driver@example.test", "correct horse battery")

    def tearDown(self) -> None:
        self.temp_dir.cleanup()

    def test_account_password_is_hashed_and_authenticates(self) -> None:
        self.assertEqual(self.db.authenticate("DRIVER@example.test", "correct horse battery")["id"], self.user_id)
        self.assertIsNone(self.db.authenticate("driver@example.test", "wrong password"))
        with self.db.connect() as connection:
            stored = connection.execute(
                "SELECT password_hash FROM users WHERE id = ?", (self.user_id,)
            ).fetchone()["password_hash"]
        self.assertNotIn("correct horse battery", stored)

    def test_seed_data_and_score_summary(self) -> None:
        totals = self.db.monthly_totals(self.user_id)
        self.assertEqual(totals["miles"], 386)
        self.assertEqual(totals["trip_count"], 24)
        self.assertEqual(totals["event_count"], 2)
        self.assertEqual(average_score(self.db.list_trips(self.user_id)), 90)

    def test_trip_and_claims_are_scoped_to_their_account(self) -> None:
        another_user = self.db.create_user("other@example.test", "another secure password")
        trip_id = self.db.add_trip(
            self.user_id,
            origin="Home",
            destination="Office",
            started_at="2026-10-20T09:00:00",
            miles=8,
            duration="20 min",
            signals={"hard_brakes": 1},
            event="Hard braking",
        )
        claim_ref = self.db.create_claim(
            self.user_id,
            incident_date="2026-10-20",
            incident_type="Collision",
            description="Minor collision",
            trip_summary={"miles": 8, "score": 79, "event": "Hard braking"},
        )
        self.assertEqual(self.db.list_trips(self.user_id)[0]["id"], trip_id)
        self.assertEqual(len(self.db.list_trips(another_user)), 4)
        self.assertEqual(self.db.list_claims(self.user_id)[0]["claim_ref"], claim_ref)
        self.assertEqual(self.db.list_claims(another_user), [])

    def test_clear_restores_demo_seed_and_preferences(self) -> None:
        self.db.update_preferences(self.user_id, theme="dark", plan="journey", tracking=False)
        self.db.create_claim(
            self.user_id,
            incident_date="2026-10-20",
            incident_type="Other",
            description="Test",
            trip_summary=None,
        )
        self.db.clear_user_demo_data(self.user_id)
        self.assertEqual(len(self.db.list_trips(self.user_id)), 4)
        self.assertEqual(self.db.list_claims(self.user_id), [])
        self.assertEqual(self.db.get_preferences(self.user_id)["plan"], "mile")
        self.assertTrue(self.db.get_preferences(self.user_id)["tracking"])

    def test_invalid_registration_and_claim_input_are_rejected(self) -> None:
        with self.assertRaises(ValueError):
            self.db.create_user("not-an-email", "long enough password")
        with self.assertRaises(ValueError):
            self.db.create_user("short@example.test", "short")
        with self.assertRaises(ValueError):
            self.db.create_claim(
                self.user_id,
                incident_date="2026-10-20",
                incident_type="Collision",
                description=" ",
                trip_summary=None,
            )


if __name__ == "__main__":
    unittest.main()
