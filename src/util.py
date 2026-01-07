from __future__ import annotations
from typing import List
from models import ApplicationRow
from datetime import datetime

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
            received_date=datetime(2026, 1, 5),
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
            received_date=datetime(2026, 1, 4),
            sender_email="applicant2@example.edu",
            attachment_filename="devin_patel_application.docx",
        ),
    ]
