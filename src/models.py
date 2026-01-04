from dataclasses import dataclass, asdict
from typing import Dict

@dataclass
class ApplicationRow:
    student_name: str = ""
    pronouns: str = ""
    student_email: str = ""
    faculty: str = ""
    major_area: str = ""
    year_of_study: str = ""

    first_generation: bool = False
    indigenous: bool = False
    racialized: bool = False
    lgbtq2si: bool = False
    disability: bool = False
    international: bool = False

    research_statement: str = ""
    leadership_statement: str = ""

    # metadata
    received_date: str = ""
    sender_email: str = ""
    attachment_filename: str = ""

    def to_dict(self) -> Dict:
        return asdict(self)
