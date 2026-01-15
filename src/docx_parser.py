from __future__ import annotations
from docx2python import docx2python
import re

def _get_cell_text(table_list, table_idx, row_idx, cell_idx):
    try:
        # docx2python: body -> table -> row -> cell -> paragraphs -> runs
        cell = table_list[table_idx][row_idx][cell_idx]
        return "\n".join("".join(run for run in paragraph) for paragraph in cell).strip()
    except (IndexError, TypeError):
        return ""

def _extract_checked_labels(text: str) -> list[str]:
    # Checkbox symbols: ☑ (\u2611), ☒ (\u2612) are checked. ☐ (\u2610) is unchecked.
    # We split by any checkbox symbol and see which one precedes the label.
    # A better way: find all checkboxes and the text following them.
    
    # Regex to find a checkbox and anything following it until the next checkbox or end of string
    pattern = r'([\u2610-\u2612])\s*([^\u2610-\u2612]+)'
    matches = re.findall(pattern, text)
    
    checked_labels = []
    for marker, label in matches:
        if marker in ['\u2611', '\u2612']:
            checked_labels.append(label.strip())
    return checked_labels

def index_parse_docx(path: str) -> dict:
    doc = docx2python(path)
    body = doc.body

    # Mapping based on structure.log
    # Item 1: Student info
    name = _get_cell_text(body, 1, 0, 1)
    pronouns = _get_cell_text(body, 1, 1, 1)
    email = _get_cell_text(body, 1, 2, 1)

    # Item 3: Eligibility Part 1
    faculty = _get_cell_text(body, 3, 0, 1)
    major = _get_cell_text(body, 3, 1, 1)
    year_text = _get_cell_text(body, 3, 2, 1)
    years_checked = _extract_checked_labels(year_text)
    year = ", ".join(years_checked)

    # Item 5: Identity
    identity_text = _get_cell_text(body, 5, 1, 1)
    identities_checked = _extract_checked_labels(identity_text)
    identity_str = " | ".join(identities_checked)

    # Statements (Large boxes)
    research_statement = _get_cell_text(body, 9, 0, 0)
    leadership_statement = _get_cell_text(body, 11, 0, 0)

    # Approvals
    approval_text = _get_cell_text(body, 12, 0, 0)
    approved = len(_extract_checked_labels(approval_text)) > 0

    # Signature/Date
    signature = _get_cell_text(body, 13, 0, 1)
    date = _get_cell_text(body, 13, 1, 1)

    return {
        "name": name,
        "pronoun": pronouns,
        "email": email,
        "faculty": faculty,
        "major": major,
        "year": year,
        "identity": identity_str,
        "research_statement": research_statement,
        "leader_statement": leadership_statement,
        "agree_to_register": approved,
        "signature": signature,
        "date": date
    }

if __name__ == "__main__":
    import json
    import os
    test_file = "soscscholarsprogramapplication-2025-26.docx"
    if os.path.exists(test_file):
        data = index_parse_docx(test_file)
        print(json.dumps(data, indent=2))
    else:
        print(f"Test file not found: {test_file}")



