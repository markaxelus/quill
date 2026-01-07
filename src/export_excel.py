from __future__ import annotations
from typing import List

import pandas as pd

from models import ApplicationRow
from util import _build_dummy_rows

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
