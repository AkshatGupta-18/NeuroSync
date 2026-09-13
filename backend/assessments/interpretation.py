DIMENSION_LABELS = {
    "stress_score": "Stress Management",
    "fatigue_score": "Energy & Recovery",
    "mental_fitness_score": "Mental Fitness",
    "cognitive_fitness_score": "Cognitive Fitness",
}


SCORE_BANDS = (
    {
        "minimum": 0,
        "maximum": 39,
        "label": "Needs attention",
    },
    {
        "minimum": 40,
        "maximum": 59,
        "label": "Developing",
    },
    {
        "minimum": 60,
        "maximum": 79,
        "label": "Good",
    },
    {
        "minimum": 80,
        "maximum": 100,
        "label": "Strong",
    },
)


DIMENSION_GUIDANCE = {
    "stress_score": {
        "Needs attention": (
            "Your stress-management indicator is currently low. "
            "Consider prioritizing short breaks, relaxation, and "
            "reducing avoidable sources of pressure."
        ),
        "Developing": (
            "Your stress-management indicator is developing. "
            "Regular breaks and simple relaxation habits may help "
            "you maintain a steadier day."
        ),
        "Good": (
            "Your stress-management indicator is in a good range. "
            "Continue the habits that help you stay balanced under "
            "everyday pressure."
        ),
        "Strong": (
            "Your stress-management indicator is strong. "
            "Your current approach to handling everyday pressure "
            "appears to be supporting good balance."
        ),
    },
    "fatigue_score": {
        "Needs attention": (
            "Your energy and recovery indicator is currently low. "
            "Pay attention to rest, sleep quality, regular meals, "
            "and sustainable activity levels."
        ),
        "Developing": (
            "Your energy and recovery indicator is developing. "
            "Consistent sleep and planned recovery breaks may help "
            "support your energy."
        ),
        "Good": (
            "Your energy and recovery indicator is in a good range. "
            "Continue protecting your sleep and recovery routines."
        ),
        "Strong": (
            "Your energy and recovery indicator is strong. "
            "Your current recovery habits appear to be supporting "
            "good day-to-day energy."
        ),
    },
    "mental_fitness_score": {
        "Needs attention": (
            "Your mental-fitness indicator is currently low. "
            "Consider making time for activities that support "
            "positive mood, emotional balance, and connection."
        ),
        "Developing": (
            "Your mental-fitness indicator is developing. "
            "Small positive routines and time for enjoyable "
            "activities may help strengthen your emotional balance."
        ),
        "Good": (
            "Your mental-fitness indicator is in a good range. "
            "Continue making space for positive activities and "
            "healthy emotional routines."
        ),
        "Strong": (
            "Your mental-fitness indicator is strong. "
            "Continue the routines and activities that support "
            "your positive emotional wellbeing."
        ),
    },
    "cognitive_fitness_score": {
        "Needs attention": (
            "Your cognitive-fitness indicator is currently low. "
            "Consider reducing distractions, taking focused breaks, "
            "and working in shorter, manageable sessions."
        ),
        "Developing": (
            "Your cognitive-fitness indicator is developing. "
            "Reducing distractions and using focused work sessions "
            "may help support concentration."
        ),
        "Good": (
            "Your cognitive-fitness indicator is in a good range. "
            "Continue using focused work habits and regular breaks."
        ),
        "Strong": (
            "Your cognitive-fitness indicator is strong. "
            "Your current focus and task-management habits appear "
            "to be supporting good cognitive performance."
        ),
    },
}


def _to_number(value):
    """Convert a numeric score to a float, returning None if invalid."""
    if value is None:
        return None

    try:
        number = float(value)
    except (TypeError, ValueError):
        return None

    if number < 0 or number > 100:
        return None

    return number


def get_score_band(score):
    """Return the user-facing interpretation band for a 0-100 score."""
    score = _to_number(score)

    if score is None:
        return None

    for band in SCORE_BANDS:
        if band["minimum"] <= score <= band["maximum"]:
            return band["label"]

    return None


def calculate_overall_score(scores):
    """
    Calculate the overall wellness score from the four dimensions.

    Only valid numeric dimensions are included in the average.
    Returns None when no valid scores are available.
    """
    values = [
        _to_number(scores.get(dimension))
        for dimension in DIMENSION_LABELS
    ]

    values = [value for value in values if value is not None]

    if not values:
        return None

    return round(sum(values) / len(values), 2)


def get_dimension_interpretation(dimension, score):
    """Return structured interpretation data for one dimension."""
    if dimension not in DIMENSION_LABELS:
        raise ValueError(f"Unknown dimension: {dimension}.")

    score = _to_number(score)
    band = get_score_band(score)

    if score is None or band is None:
        return {
            "dimension": dimension,
            "label": DIMENSION_LABELS[dimension],
            "score": None,
            "status": None,
            "guidance": None,
        }

    return {
        "dimension": dimension,
        "label": DIMENSION_LABELS[dimension],
        "score": score,
        "status": band,
        "guidance": DIMENSION_GUIDANCE[dimension][band],
    }


def interpret_scores(scores):
    """
    Generate a complete wellness interpretation from assessment scores.
    """
    if not isinstance(scores, dict):
        raise ValueError("Scores must be an object.")

    dimensions = [
        get_dimension_interpretation(
            dimension,
            scores.get(dimension),
        )
        for dimension in DIMENSION_LABELS
    ]

    valid_dimensions = [
        dimension
        for dimension in dimensions
        if dimension["score"] is not None
    ]

    overall_score = calculate_overall_score(scores)
    overall_status = get_score_band(overall_score)

    strongest_dimension = None
    priority_dimension = None

    if valid_dimensions:
        strongest_dimension = max(
            valid_dimensions,
            key=lambda dimension: dimension["score"],
        )

        priority_dimension = min(
            valid_dimensions,
            key=lambda dimension: dimension["score"],
        )

    return {
        "overall_score": overall_score,
        "overall_status": overall_status,
        "strongest_dimension": strongest_dimension,
        "priority_dimension": priority_dimension,
        "dimensions": dimensions,
    }