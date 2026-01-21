from __future__ import annotations
from docx2python import docx2python
import re

def _get_cell_text_from_node(cell):
    try:
        return "\n".join("".join(run for run in paragraph) for paragraph in cell).strip()
    except (IndexError, TypeError):
        return ""

def _find_data_by_label(body, label_text):
    """
    Searches all tables for a cell containing label_text.
    Returns the text content of the cell immediately to the right.
    """
    label_text_lower = label_text.lower().strip()
    for table in body:
        for row in table:
            for i, cell in enumerate(row):
                cell_text = _get_cell_text_from_node(cell).lower()
                if label_text_lower in cell_text:
                    # If there's a cell to the right, that's usually the data
                    if i + 1 < len(row):
                        return _get_cell_text_from_node(row[i+1])
                    # If no cell to the right, maybe it's in the same cell after the label?
                    # (Though usually it's in a separate cell in these forms)
    return ""

def _find_box_after_label(body, label_text):
    """
    Searches for a specific label and returns the content of the following table or large cell.
    Useful for statements like 'Research Statement'.
    """
    label_text_lower = label_text.lower().strip()
    for table_idx, table in enumerate(body):
        for row_idx, row in enumerate(table):
            for cell_idx, cell in enumerate(row):
                cell_text = _get_cell_text_from_node(cell).lower()
                if label_text_lower in cell_text:
                    # Often the statement is in the VERY NEXT table or the VERY NEXT row/cell
                    # In this specific template, statements are often in their own table below the header
                    if table_idx + 1 < len(body):
                        # Return the first cell text of the next table
                        return _get_cell_text_from_node(body[table_idx+1][0][0])
    return ""

def _extract_checked_labels(text: str) -> list[str]:
    # Checkbox symbols: ☑ (\u2611), ☒ (\u2612) are checked. ☐ (\u2610) is unchecked.
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

    # Student info
    name = _find_data_by_label(body, "Full Name")
    pronouns = _find_data_by_label(body, "Pronouns")
    email = _find_data_by_label(body, "Email Address")

    # Eligibility / Major
    faculty = _find_data_by_label(body, "Faculty/Program")
    major = _find_data_by_label(body, "Major")
    
    # Year level - searching for the 'Year of Study' label and then extracting checkboxes
    year_text = _find_data_by_label(body, "Year of Study")
    if not year_text:
        # Fallback search if it's in a different table structure
        year_text = _find_data_by_label(body, "Level of Study")
        
    years_checked = _extract_checked_labels(year_text)
    year = ", ".join(years_checked)

    # Identity
    identity_text = _find_data_by_label(body, "Select all that apply")
    identities_checked = _extract_checked_labels(identity_text)
    identity_str = " | ".join(identities_checked)

    # Statements (Large boxes)
    research_statement = _find_box_after_label(body, "Research Statement")
    leadership_statement = _find_box_after_label(body, "Leadership Statement")

    # Approvals / Agreement
    approval_text = _find_data_by_label(body, "I agree to register")
    if not approval_text:
        # Fallback search for common terms
        approval_text = _find_data_by_label(body, "Registration Agreement")
    
    approved = len(_extract_checked_labels(approval_text)) > 0 or "yes" in approval_text.lower()

    # Signature/Date
    signature = _find_data_by_label(body, "Signature")
    date = _find_data_by_label(body, "Date")

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



