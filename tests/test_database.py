import tempfile
import unittest
from pathlib import Path

from database import SAMPLE_TRIPS, DriveFairDatabase
from localization import translate
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
        self.assertEqual(estimate["total"], 703.0)
        self.assertEqual(estimate["score_adjustment"], -25.0)
        self.assertEqual(estimate["usage"], 579.0)
        self.assertAlmostEqual(
            estimate["base"] + estimate["usage"] + estimate["score_adjustment"] - estimate["reward"],
            estimate["total"],
        )

    def test_average_score_has_safe_empty_default(self) -> None:
        self.assertEqual(average_score([]), 95)

    def test_indian_plan_rates_are_in_rupees_and_kilometres(self) -> None:
        per_km = estimate_premium("mile", 10, 0, 85)
        per_trip = estimate_premium("journey", 10, 2, 85)
        self.assertEqual(per_km["usage"], 15.0)
        self.assertEqual(per_km["usage_label"], "10 km × ₹1.50")
        self.assertEqual(per_trip["usage"], 40.0)

    def test_hindi_catalogue_translates_and_falls_back_to_english(self) -> None:
        self.assertEqual(translate("Claims", "हिन्दी"), "दावे")
        self.assertEqual(translate("Claims", "English"), "Claims")
        self.assertEqual(translate("Unknown copy", "हिन्दी"), "Unknown copy")


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
        self.assertAlmostEqual(totals["miles"], 310.686 + (38.5 / 1.60934), places=1)
        self.assertEqual(totals["trip_count"], 24)
        self.assertEqual(totals["event_count"], 2)
        self.assertEqual(average_score(self.db.list_trips(self.user_id)), 90)

    def test_legacy_us_sample_trips_are_replaced_without_changing_real_trips(self) -> None:
        legacy_routes = (
            ("Home, Brooklyn", "Studio, Manhattan"),
            ("Studio, Manhattan", "Market, Williamsburg"),
            ("Home, Brooklyn", "Riverside Park"),
            ("Friends, Queens", "Home, Brooklyn"),
        )
        with self.db.connect() as connection:
            for sample_trip, (origin, destination) in zip(
                connection.execute(
                    "SELECT id FROM trips WHERE user_id = ? AND is_sample = 1 ORDER BY id",
                    (self.user_id,),
                ).fetchall(),
                legacy_routes,
            ):
                connection.execute(
                    "UPDATE trips SET origin = ?, destination = ? WHERE id = ?",
                    (origin, destination, sample_trip["id"]),
                )
        real_trip_id = self.db.add_trip(
            self.user_id,
            origin="User-entered origin",
            destination="User-entered destination",
            started_at="2026-10-20T09:00:00",
            miles=8,
            duration="20 min",
            signals={},
            event="",
        )

        self.db.initialize()

        trips = self.db.list_trips(self.user_id)
        sample_routes = {
            (trip["origin"], trip["destination"])
            for trip in trips
            if trip["is_sample"]
        }
        self.assertEqual(
            sample_routes,
            {
                (trip["origin"], trip["destination"])
                for trip in SAMPLE_TRIPS
            },
        )
        real_trip = next(trip for trip in trips if trip["id"] == real_trip_id)
        self.assertEqual(
            (real_trip["origin"], real_trip["destination"]),
            ("User-entered origin", "User-entered destination"),
        )

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
        self.assertEqual(self.db.get_preferences(self.user_id)["language"], "English")

    def test_language_preference_persists_and_rejects_unsupported_values(self) -> None:
        self.db.update_preferences(self.user_id, language="हिन्दी")
        self.assertEqual(self.db.get_preferences(self.user_id)["language"], "हिन्दी")
        with self.assertRaises(ValueError):
            self.db.update_preferences(self.user_id, language="Tamil")

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
