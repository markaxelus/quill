from __future__ import annotations
from docx2python import docx2python

from models import ApplicationRow

def _norm(s: str) -> str:
  return (s or "").strip()

def parse_docx(path: str):
  doc = docx2python(path)
  row = ApplicationRow()

  # doc.body -> tables -> rows -> cells -> paragraphs -> runs
  for table in doc.body:
    for r in table:
      cells = []
      for cell in r:
        # flatten all text in the cell so checkboxes show up
        text = "".join(
          run
          for paragraph in cell
          for run in paragraph
        )
        cells.append(repr(text))
      print(cells)


parse_docx("C:\\Users\\max3l\\Downloads\\soscscholarsprogramapplication-2025-26.docx")