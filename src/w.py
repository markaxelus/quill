from __future__ import annotations

from docx2python import docx2python

from models import ApplicationRow

CHECK_TOKENS = ("☑", "☒", "✓", "✔", "[x]", "(x)", "ミ`")

FIELD_KEYWORDS = [
    ("student_name", ("student name", "full name", "name")),
    ("pronouns", ("pronoun",)),
    ("student_email", ("email", "email address")),
    ("faculty", ("faculty",)),
    ("major_area", ("major", "area of study", "discipline")),
    ("year_of_study", ("year", "year of study")),
    ("research_statement", ("research statement", "research essay")),
    ("leadership_statement", ("leadership statement", "leadership essay")),
]

BOOL_KEYWORDS = [
    ("first_generation", ("first generation", "first-generation")),
    ("indigenous", ("indigenous",)),
    ("racialized", ("racialized",)),
    ("lgbtq2si", ("lgbtq", "2slgbtq")),
    ("disability", ("disability", "disabled")),
    ("international", ("international",)),
]


def _norm(s: str) -> str:
    return (s or "").strip()


def _cell_text(cell) -> str:
    """Recursively collapse docx2python cell structures into a string."""
    if isinstance(cell, str):
        return cell
    if isinstance(cell, (list, tuple)):
        parts = [_cell_text(part) for part in cell]
        return "\n".join(part for part in parts if part)
    return str(cell)


def _split_label_value(text: str) -> tuple[str, str] | tuple[None, None]:
    for sep in (":", "—", "-", "–"):
        if sep in text:
            label, value = text.split(sep, 1)
            label = _norm(label)
            value = _norm(value)
            if label and value:
                return label, value
    return None, None


def _matches_keywords(target: str, keywords: tuple[str, ...]) -> bool:
    return any(k in target for k in keywords)


def _assign_field(row: ApplicationRow, label: str, value: str) -> bool:
    label_lower = label.lower()
    for attr, keywords in FIELD_KEYWORDS:
        if _matches_keywords(label_lower, keywords):
            current = getattr(row, attr)
            if isinstance(current, str) and current:
                # keep longer value to preserve richer responses
                if len(value) > len(current):
                    setattr(row, attr, value)
            else:
                setattr(row, attr, value)
            return True

    bool_value = value.lower() in {"yes", "y", "true", "checked", "x", "☑", "☒", "✓", "selected"}
    for attr, keywords in BOOL_KEYWORDS:
        if _matches_keywords(label_lower, keywords):
            setattr(row, attr, bool_value)
            return True

    return False


def _mark_boolean_from_text(row: ApplicationRow, text: str) -> None:
    lowered = text.lower()
    has_check = any(token.lower() in lowered for token in CHECK_TOKENS) or "checked" in lowered
    if not has_check:
        return

    for attr, keywords in BOOL_KEYWORDS:
        if _matches_keywords(lowered, keywords):
            setattr(row, attr, True)


def _iter_rows(body_data):
    """Yield normalized rows (tables + paragraphs) from docx2python body."""
    for section in body_data:
        for table in section:
            if not table:
                continue
            for row in table:
                cells = [_norm(_cell_text(cell)) for cell in row]
                if any(cells):
                    yield cells


def parse_application_docx(path: str) -> ApplicationRow:
    row = ApplicationRow()
    with docx2python(path, html=False) as doc:
        rows = list(_iter_rows(doc.body))

        for cells in rows:
            if len(cells) >= 2:
                label, value = cells[0], cells[1]
                if label and value:
                    if _assign_field(row, label, value):
                        continue

            # treat single-cell rows (and unhandled tables) as paragraph/in-line text
            text = cells[0]
            if not text:
                continue

            label, value = _split_label_value(text)
            if label and value and _assign_field(row, label, value):
                continue

            _mark_boolean_from_text(row, text)

        paragraph_lines = [
            line.strip()
            for line in doc.text.splitlines()
            if line.strip()
        ]
        row.research_statement = _extract_section(paragraph_lines, ["research statement", "research essay", "research"])
        row.leadership_statement = _extract_section(paragraph_lines, ["leadership statement", "leadership essay", "leadership"])

    return row


def _extract_section(paragraphs: list[str], heading_keywords: list[str]) -> str:
    start = None
    for idx, text in enumerate(paragraphs):
        tl = text.lower()
        if any(k in tl for k in heading_keywords) and len(text) <= 80:
            start = idx + 1
            break
    if start is None:
        return ""

    out: list[str] = []
    for text in paragraphs[start:]:
        if not text:
            continue
        tl = text.lower()
        if len(text) <= 80 and (text.endswith(":") or any(k in tl for k in ["metadata", "signature", "student info", "research statement", "leadership statement"])):
            break
        out.append(text)

    return "\n".join(out).strip()
