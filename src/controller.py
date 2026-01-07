from __future__ import annotations
from datetime import datetime
from typing import Callable, List

from outlook_client import OutlookClient
from docx_parser import parse_docx
from export_excel import export_rows_to_excel
from models import ApplicationRow
from util import _build_dummy_rows


def run_parse(
    folder: str,
    subject_filter: str,
    from_date: datetime,
    output_path: str,
) -> None:
  
  client = OutlookClient()
  rows: List[ApplicationRow] = []

  # attachments = list(client.scan_docx_attachments(folder, subject_filter, from_date))
  dummy_rows = _build_dummy_rows()

  for idx, att in enumerate(dummy_rows, start=1):
    """ row = ApplicationRow()
    try:
      row = _build_dummy_rows()[0]
    except Exception as e:
      print(f"[PARSER ERROR] #{idx}: {att.attachment_filename} -> {e}")
 """
    row = ApplicationRow(**att.to_dict())
    # Populate metadata regardless of parse success
    row.received_date = datetime.now()
    row.sender_email = att.sender_email
    row.attachment_filename = att.attachment_filename

    rows.append(row)
    print(f"[PARSED] #{idx}: {att.attachment_filename}")

  if not rows:
    print("No rows parsed; skipping Excel export.")
    return

  export_rows_to_excel(rows, output_path)
  print(f"Excel written: {output_path}")


if __name__ == "__main__":
  run_parse(
    folder="Inbox",
    subject_filter="Scholars",
    from_date=datetime(2025, 12, 1),
    output_path="parsed_applications.xlsx",
  )
