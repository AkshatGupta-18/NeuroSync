from decimal import Decimal

from django.test import SimpleTestCase

from .interpretation import (
    calculate_overall_score,
    get_dimension_interpretation,
    get_score_band,
    interpret_scores,
)


class ScoreBandTests(SimpleTestCase):

    def test_score_bands(self):
        test_cases = [
            (0, "Needs attention"),
            (39, "Needs attention"),
            (40, "Developing"),
            (59, "Developing"),
            (60, "Good"),
            (79, "Good"),
            (80, "Strong"),
            (100, "Strong"),
        ]

        for score, expected_band in test_cases:
            with self.subTest(score=score):
                self.assertEqual(
                    get_score_band(score),
                    expected_band,
                )

    def test_decimal_score_is_supported(self):
        self.assertEqual(
            get_score_band(Decimal("75.50")),
            "Good",
        )

    def test_invalid_scores_return_none(self):
        invalid_scores = [
            None,
            -1,
            101,
            "not-a-score",
        ]

        for score in invalid_scores:
            with self.subTest(score=score):
                self.assertIsNone(get_score_band(score))


class OverallScoreTests(SimpleTestCase):

    def test_calculates_average_of_four_dimensions(self):
        scores = {
            "stress_score": 50,
            "fatigue_score": 37.5,
            "mental_fitness_score": 62.5,
            "cognitive_fitness_score": 75,
        }

        self.assertEqual(
            calculate_overall_score(scores),
            56.25,
        )

    def test_calculates_overall_score_with_decimal_values(self):
        scores = {
            "stress_score": Decimal("50.00"),
            "fatigue_score": Decimal("37.50"),
            "mental_fitness_score": Decimal("62.50"),
            "cognitive_fitness_score": Decimal("75.00"),
        }

        self.assertEqual(
            calculate_overall_score(scores),
            56.25,
        )

    def test_ignores_missing_dimension_scores(self):
        scores = {
            "stress_score": 60,
            "fatigue_score": None,
            "mental_fitness_score": 80,
            "cognitive_fitness_score": None,
        }

        self.assertEqual(
            calculate_overall_score(scores),
            70.0,
        )

    def test_returns_none_when_no_valid_scores_exist(self):
        scores = {
            "stress_score": None,
            "fatigue_score": None,
            "mental_fitness_score": None,
            "cognitive_fitness_score": None,
        }

        self.assertIsNone(calculate_overall_score(scores))


class DimensionInterpretationTests(SimpleTestCase):

    def test_dimension_interpretation_contains_expected_fields(self):
        result = get_dimension_interpretation(
            "cognitive_fitness_score",
            75,
        )

        self.assertEqual(
            result["dimension"],
            "cognitive_fitness_score",
        )
        self.assertEqual(
            result["label"],
            "Cognitive Fitness",
        )
        self.assertEqual(result["score"], 75.0)
        self.assertEqual(result["status"], "Good")
        self.assertIsInstance(result["guidance"], str)
        self.assertTrue(result["guidance"])

    def test_invalid_dimension_raises_error(self):
        with self.assertRaises(ValueError):
            get_dimension_interpretation(
                "unknown_score",
                50,
            )

    def test_invalid_score_returns_empty_interpretation(self):
        result = get_dimension_interpretation(
            "stress_score",
            None,
        )

        self.assertEqual(
            result,
            {
                "dimension": "stress_score",
                "label": "Stress Management",
                "score": None,
                "status": None,
                "guidance": None,
            },
        )


class CompleteInterpretationTests(SimpleTestCase):

    def setUp(self):
        self.scores = {
            "stress_score": 50,
            "fatigue_score": 37.5,
            "mental_fitness_score": 62.5,
            "cognitive_fitness_score": 75,
        }

    def test_interpret_scores_returns_overall_information(self):
        result = interpret_scores(self.scores)

        self.assertEqual(
            result["overall_score"],
            56.25,
        )
        self.assertEqual(
            result["overall_status"],
            "Developing",
        )

    def test_identifies_strongest_dimension(self):
        result = interpret_scores(self.scores)

        self.assertEqual(
            result["strongest_dimension"]["dimension"],
            "cognitive_fitness_score",
        )
        self.assertEqual(
            result["strongest_dimension"]["score"],
            75.0,
        )

    def test_identifies_priority_dimension(self):
        result = interpret_scores(self.scores)

        self.assertEqual(
            result["priority_dimension"]["dimension"],
            "fatigue_score",
        )
        self.assertEqual(
            result["priority_dimension"]["score"],
            37.5,
        )

    def test_returns_all_four_dimensions(self):
        result = interpret_scores(self.scores)

        self.assertEqual(
            len(result["dimensions"]),
            4,
        )

        dimension_ids = {
            dimension["dimension"]
            for dimension in result["dimensions"]
        }

        self.assertEqual(
            dimension_ids,
            {
                "stress_score",
                "fatigue_score",
                "mental_fitness_score",
                "cognitive_fitness_score",
            },
        )

    def test_invalid_input_type_raises_error(self):
        with self.assertRaises(ValueError):
            interpret_scores([])

    def test_partial_scores_are_supported(self):
        result = interpret_scores(
            {
                "stress_score": 80,
                "fatigue_score": None,
                "mental_fitness_score": 60,
                "cognitive_fitness_score": None,
            }
        )

        self.assertEqual(
            result["overall_score"],
            70.0,
        )
        self.assertEqual(
            result["overall_status"],
            "Good",
        )
        self.assertEqual(
            result["strongest_dimension"]["dimension"],
            "stress_score",
        )
        self.assertEqual(
            result["priority_dimension"]["dimension"],
            "mental_fitness_score",
        )