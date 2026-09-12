from decimal import Decimal, ROUND_HALF_UP


QUESTIONS = {
    "stress": [
        {
            "id": "stress_worry",
            "question": "How often did you feel worried today?",
            "reverse": True,
        },
        {
            "id": "stress_pressure",
            "question": "How often did you feel under pressure?",
            "reverse": True,
        },
        {
            "id": "stress_relax",
            "question": "How hard was it to relax today?",
            "reverse": True,
        },
        {
            "id": "stress_upset",
            "question": "How often did small things make you feel upset?",
            "reverse": True,
        },
    ],
    "fatigue": [
        {
            "id": "energy_level",
            "question": "How much energy did you have today?",
            "reverse": False,
        },
        {
            "id": "daytime_tiredness",
            "question": "How tired did you feel during the day?",
            "reverse": True,
        },
        {
            "id": "sleep_refresh",
            "question": "How fresh did you feel after sleeping?",
            "reverse": False,
        },
        {
            "id": "task_start",
            "question": "How hard was it to get started with your tasks?",
            "reverse": True,
        },
    ],
    "mental_fitness": [
        {
            "id": "mood",
            "question": "How would you describe your mood today?",
            "reverse": False,
        },
        {
            "id": "enjoyment",
            "question": (
                "How interested were you in things you usually enjoy?"
            ),
            "reverse": False,
        },
        {
            "id": "positivity",
            "question": "How positive did you feel today?",
            "reverse": False,
        },
        {
            "id": "emotional_control",
            "question": "How well could you handle your feelings today?",
            "reverse": False,
        },
    ],
    "cognitive_fitness": [
        {
            "id": "focus",
            "question": "How well could you focus today?",
            "reverse": False,
        },
        {
            "id": "distraction",
            "question": "How easily did your mind get distracted?",
            "reverse": True,
        },
        {
            "id": "clarity",
            "question": "How clearly could you think today?",
            "reverse": False,
        },
        {
            "id": "task_completion",
            "question": "How well could you finish your tasks?",
            "reverse": False,
        },
    ],
}


OPTION_LABELS = {
    1: "Very low",
    2: "Low",
    3: "Okay",
    4: "Good",
    5: "Very good",
}


def get_all_question_ids():
    """Return every valid question ID in the assessment."""
    return {
        question["id"]
        for dimension_questions in QUESTIONS.values()
        for question in dimension_questions
    }


def get_question_count():
    """Return the total number of questions."""
    return sum(
        len(dimension_questions)
        for dimension_questions in QUESTIONS.values()
    )


def validate_responses(responses):
    """
    Validate the complete set of assessment responses.

    Every question must be answered exactly once with an integer
    from 1 to 5.
    """
    if not isinstance(responses, dict):
        raise ValueError("Responses must be an object.")

    expected_ids = get_all_question_ids()
    received_ids = set(responses.keys())

    missing_ids = expected_ids - received_ids
    unknown_ids = received_ids - expected_ids

    if missing_ids:
        missing = ", ".join(sorted(missing_ids))
        raise ValueError(
            f"Missing responses for: {missing}."
        )

    if unknown_ids:
        unknown = ", ".join(sorted(unknown_ids))
        raise ValueError(
            f"Unknown question IDs: {unknown}."
        )

    for question_id, value in responses.items():
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValueError(
                f"Response for '{question_id}' must be an integer from 1 to 5."
            )

        if value < 1 or value > 5:
            raise ValueError(
                f"Response for '{question_id}' must be between 1 and 5."
            )

    return True


def _convert_to_wellness_score(value):
    """
    Convert a 1-5 response into a 0-100 wellness score.

    1 -> 0
    2 -> 25
    3 -> 50
    4 -> 75
    5 -> 100
    """
    return (value - 1) * 25


def _score_question(value, reverse):
    """Convert a response into a positive wellness score."""
    if reverse:
        value = 6 - value

    return _convert_to_wellness_score(value)


def _calculate_dimension_score(responses, questions):
    """Calculate the average 0-100 score for one dimension."""
    scores = [
        _score_question(
            responses[question["id"]],
            question["reverse"],
        )
        for question in questions
    ]

    average = sum(scores) / len(scores)

    return Decimal(str(average)).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def calculate_scores(responses):
    """
    Calculate all NeuroSync wellness scores.

    Returns scores on a 0-100 scale where a higher value means
    a stronger wellness indicator.
    """
    validate_responses(responses)

    return {
        "stress_score": _calculate_dimension_score(
            responses,
            QUESTIONS["stress"],
        ),
        "fatigue_score": _calculate_dimension_score(
            responses,
            QUESTIONS["fatigue"],
        ),
        "mental_fitness_score": _calculate_dimension_score(
            responses,
            QUESTIONS["mental_fitness"],
        ),
        "cognitive_fitness_score": _calculate_dimension_score(
            responses,
            QUESTIONS["cognitive_fitness"],
        ),
    }