from __future__ import annotations
from typing import List

import pandas as pd

from models import ApplicationRow


def _build_dummy_rows() -> List[ApplicationRow]:
    return [
        ApplicationRow(
            student_name="Alex Morgan",
            pronouns="she/her",
            student_email="alex.morgan@example.edu",
            faculty="Arts & Science",
            major_area="Sociology",
            year_of_study="3",
            first_generation=True,
            indigenous=False,
            racialized=True,
            lgbtq2si=False,
            disability=False,
            international=False,
            research_statement="Interested in urban community networks and peer mentorship.",
            leadership_statement="Led campus mutual aid drives supporting first-generation students.",
            received_date="2026-01-05",
            sender_email="applicant1@example.edu",
            attachment_filename="alex_morgan_application.docx",
        ),
        ApplicationRow(
            student_name="Devin Patel",
            pronouns="he/him",
            student_email="devin.patel@example.edu",
            faculty="Faculty of Social Sciences",
            major_area="Political Science",
            year_of_study="2",
            first_generation=False,
            indigenous=False,
            racialized=True,
            lgbtq2si=True,
            disability=False,
            international=True,
            research_statement="Exploring policy interventions for refugee resettlement success.",
            leadership_statement="Co-founded an international students association providing tutoring.",
            received_date="2026-01-04",
            sender_email="applicant2@example.edu",
            attachment_filename="devin_patel_application.docx",
        ),
    ]

def export_rows_to_excel(rows: List[ApplicationRow], output_path: str) -> None:
    df = pd.DataFrame([r.to_dict() for r in rows])
    
    ordered = [
        "student_name","pronouns","student_email",
        "faculty","major_area","year_of_study",
        "first_generation","indigenous","racialized","lgbtq2si","disability","international",
        "research_statement","leadership_statement",
        "received_date","sender_email","attachment_filename"
    ]

    for c in ordered:
        if c not in ordered:
            df[c] = ""

    df.to_excel(output_path, index=False, engine="openpyxl")
    

if __name__ == "__main__":
    dummy_rows = _build_dummy_rows()
    export_rows_to_excel(dummy_rows, "C:\\Users\\max3l\\Downloads\\sample_applications.xlsx")
    print("Exported sample_applications.xlsx")
