
import re
from decimal import Decimal, InvalidOperation


ROW_Y_TOLERANCE = 2.5

HEADER_ALIASES = {
    "analyte": {"analyte", "parameter", "test", "investigation"},
    "result": {"result", "observed", "value"},
    "unit": {"unit", "units"},
    "reference": {"reference", "interval", "range"},
    "flag": {"flag", "status"},
}

NUMBER_PATTERN = re.compile(
    r"^\s*[-+]?\d+(?:,\d{3})*(?:\.\d+)?\s*$"
)

RANGE_PATTERN = re.compile(
    r"^\s*([<>]=?)?\s*([-+]?\d[\d,]*(?:\.\d+)?)"
    r"(?:\s*[-–—]\s*([-+]?\d[\d,]*(?:\.\d+)?))?\s*$"
)

VALID_FLAGS = {
    "LOW",
    "HIGH",
    "NORMAL",
    "L",
    "H",
    "ABN",
    "ABNORMAL",
    "POSITIVE",
    "NEGATIVE",
    "POS",
    "NEG",
    "REACTIVE",
    "NONREACTIVE",
    "DETECTED",
    "NOT DETECTED",
    "—",
    "-",
    "–",
}


def _group_words_by_line(words):
    """Group PDF words by their vertical positions."""
    lines = []

    for word in sorted(words, key=lambda item: (item[1], item[0])):
        x0, y0, x1, y1, text = word[:5]

        matching_line = next(
            (
                line
                for line in lines
                if abs(line["y"] - y0) <= ROW_Y_TOLERANCE
            ),
            None,
        )

        if matching_line is None:
            matching_line = {
                "y": y0,
                "words": [],
            }
            lines.append(matching_line)

        matching_line["words"].append((x0, x1, text))

    for line in lines:
        line["words"].sort(key=lambda item: item[0])

    return sorted(lines, key=lambda line: line["y"])


def _find_header(line):
    """Discover table columns from header labels."""
    tokens = [
        (
            x0,
            x1,
            re.sub(r"[^a-z]", "", text.lower()),
        )
        for x0, x1, text in line["words"]
    ]

    centers = {}

    for column, aliases in HEADER_ALIASES.items():
        matches = [
            (x0 + x1) / 2
            for x0, x1, token in tokens
            if token in aliases
        ]

        if not matches:
            return None

        centers[column] = sum(matches) / len(matches)

    ordered = sorted(
        (position, name)
        for name, position in centers.items()
    )

    expected_order = [
        "analyte",
        "result",
        "unit",
        "reference",
        "flag",
    ]

    if [name for _, name in ordered] != expected_order:
        return None

    return [
        (ordered[index][0] + ordered[index + 1][0]) / 2
        for index in range(len(ordered) - 1)
    ]


def _assign_columns(line, boundaries):
    """Assign words to dynamically discovered table columns."""
    columns = {
        "analyte": [],
        "result": [],
        "unit": [],
        "reference": [],
        "flag": [],
    }

    for x0, x1, text in line["words"]:
        center = (x0 + x1) / 2

        if center < boundaries[0]:
            column = "analyte"
        elif center < boundaries[1]:
            column = "result"
        elif center < boundaries[2]:
            column = "unit"
        elif center < boundaries[3]:
            column = "reference"
        else:
            column = "flag"

        columns[column].append(text)

    return {
        key: " ".join(value).strip()
        for key, value in columns.items()
    }


def _normalize_name(name):
    """Create a searchable fallback name without inventing terminology."""
    return re.sub(r"\s+", " ", name.strip()).lower()[:150]


def _parse_decimal(value):
    try:
        return Decimal(value.replace(",", "").strip())
    except (InvalidOperation, ValueError):
        return None


def _parse_reference_range(reference):
    """Parse numeric ranges and one-sided reference limits."""
    match = RANGE_PATTERN.fullmatch(
        reference.replace("−", "-")
    )

    if not match:
        return None, None

    operator, first, second = match.groups()
    first_value = _parse_decimal(first)

    if first_value is None:
        return None, None

    if second is not None:
        second_value = _parse_decimal(second)

        if second_value is None:
            return None, None

        return (
            min(first_value, second_value),
            max(first_value, second_value),
        )

    if operator in ("<", "<="):
        return None, first_value

    if operator in (">", ">="):
        return first_value, None

    return None, None


def _get_status(value, reference_min, reference_max, flag):
    """Compare numeric results with the supplied reference interval."""
    if value is not None:
        if reference_min is not None and value < reference_min:
            return "low"

        if reference_max is not None and value > reference_max:
            return "high"

        if reference_min is not None or reference_max is not None:
            return "normal"

    normalized_flag = flag.strip().upper()

    if normalized_flag in {"LOW", "L"}:
        return "low"

    if normalized_flag in {"HIGH", "H"}:
        return "high"

    if normalized_flag in {"ABN", "ABNORMAL"}:
        return "abnormal"

    return "unknown"


def _extract_measurement(columns, page_number):
    """Convert a reconstructed table row into a generic measurement."""
    name = columns["analyte"]
    result = columns["result"]
    unit = columns["unit"]
    reference = columns["reference"]
    flag = columns["flag"].strip().upper()

    if not name or not result or not unit or not reference:
        return None

    if len(name) > 150 or len(result) > 200:
        return None

    # Recover trailing analyte text when a long name overlaps
    # the result column in the PDF's horizontal layout.
    numeric_match = re.fullmatch(
        r"\s*(.*?)\s*([-+]?\d+(?:,\d{3})*(?:\.\d+)?)\s*",
        result,
    )

    if numeric_match:
        extra_name, numeric_result = numeric_match.groups()

        if extra_name:
            name = f"{name} {extra_name}".strip()

        result = numeric_result
        value = _parse_decimal(result)
        qualitative_value = ""
    else:
        value = None
        qualitative_value = result

    qualitative_result = flag in VALID_FLAGS

    if value is None and not qualitative_result:
        return None

    reference_min, reference_max = _parse_reference_range(reference)

    # Numeric rows without a parseable numeric reference interval
    # are not classified automatically in this initial parser.
    if (
        value is not None
        and reference_min is None
        and reference_max is None
    ):
        return None

    status = _get_status(
        value,
        reference_min,
        reference_max,
        flag,
    )

    source_text = " | ".join(
        columns[key]
        for key in (
            "analyte",
            "result",
            "unit",
            "reference",
            "flag",
        )
    )

    return {
        "analyte_name": name[:150],
        "normalized_name": _normalize_name(name),
        "value": value,
        "qualitative_value": qualitative_value[:200],
        "unit": unit[:50],
        "reference_range_text": reference[:150],
        "reference_min": reference_min,
        "reference_max": reference_max,
        "status": status,
        "source_text": source_text,
        "confidence": None,
        "page_number": page_number,
    }


def extract_measurements(document):
    """
    Extract generic measurements from selectable-text PDF tables.

    Column positions are discovered from headings on each page.
    No biomarker or disease whitelist is used.

    This initial implementation supports the verified five-column
    table structure. Other layouts require additional strategies.
    """
    measurements = []
    warnings = []

    for page_number, page in enumerate(document, start=1):
        lines = _group_words_by_line(
            page.get_text("words", sort=True)
        )

        active_boundaries = None

        for line in lines:
            detected_header = _find_header(line)

            if detected_header is not None:
                active_boundaries = detected_header
                continue

            if active_boundaries is None:
                continue

            columns = _assign_columns(
                line,
                active_boundaries,
            )

            measurement = _extract_measurement(
                columns,
                page_number,
            )

            if measurement is not None:
                measurements.append(measurement)

    if not measurements:
        warnings.append(
            "No supported measurement tables were detected. "
            "Manual review is required."
        )

    return {
        "measurements": measurements,
        "warnings": warnings,
        "measurement_count": len(measurements),
    }
