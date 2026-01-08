from __future__ import annotations
from docx2python import docx2python

from models import ApplicationRow
import os

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

# return a concat of checkboxes
def check_checkboxes(checkboxes:list)->str:
  checked = []
  if not isinstance(checkboxes,list):
    if checkboxes[0].encode('utf-8') == b'\xe2\x98\x92':
      return checkboxes[1:]
    return ''
  else:
    
    for item in checkboxes:
      if item[0].encode('utf-8') == b'\xe2\x98\x92':
        checked.append(item[1:])

    text = ",".join(checked)
    return text

def text_join(sentence:str)->str:
    return "".join(
          run
          for paragraph in sentence
          for run in paragraph
        )

def check_year(years:str)->str:
  # check if 
  split_year = years.split(",")
  if(len(split_year) == 1):
    if "first" in split_year[0].lower():
      return "1"
    elif "second" in split_year[0].lower():
      return "2"
    elif "third" in split_year[0].lower():
      return "3"
    elif "fourth" in split_year[0].lower():
      return "4"
    elif "fifth" in split_year[0].lower():
      return "5"
    elif "sixth" in split_year[0].lower():
      return "6"
    elif "seveth" in split_year[0].lower():
      return "7"
    else:
      other_year = split_year[0].split(" ")
      return other_year[1]
  else:
    return years
  
def check_margin(margin:str)->list:
  output_list = [False]*6
  if "Inuit" in margin:
    output_list[0] = True
  if "racialized" in margin:
    output_list[1] = True
  if "LGBTQ2SI+" in margin:
    output_list[2] = True 
  if "physical" in margin:
    output_list[3] = True
  if "generation" in margin:
    output_list[4] = True
  if "International" in margin:
    output_list[5] = True 
  return output_list

# Index parser, a function that'll go to the specific index of the doc.body
# and parser the used information
def index_parse_docx(path:str) -> ApplicationRow:
  doc = docx2python(path)

  student_info = doc.body[1]
  eligibility_info = doc.body[3:7]
  research_info = doc.body[8:10]
  leader_info = doc.body[10:12]
  approval_info = doc.body[12:14] 


  # Student info
  name = student_info[0][1][0]
  pronoun = student_info[1][1][0]
  email = student_info[2][1][0]

  # Eligibility info 
  # index one : 0 is faculty/major/year, 1 is other year box, 2 is identity, 3 is other identity box
  # index two : which row
  # index three: which column
  faculty = eligibility_info[0][0][1][0]
  major = eligibility_info[0][1][1][0]
  year = check_checkboxes(eligibility_info[0][2][1])
  other_year = eligibility_info[1][0][0][0]

  self_identity = check_checkboxes(eligibility_info[2][1][1])
  other_identity = eligibility_info[3][0][0][0]
  
  if other_year != '':
    year= year[:-1] +":"+ other_year

  if other_identity != '':
    self_identity += other_identity

  # Research Statement
  research_statement = text_join(research_info[1][0][0])
  # print(research_statement)

  # Leader Statement
  leader_statement = text_join(leader_info[1][0][0])
  # print(leader_statement)

  # Approvals
  agree_to_register = True if check_checkboxes(approval_info[0][0][0][3]) else False
  signature = approval_info[1][0][1][0]

  #TODO: Need a check if user put different type of string
  date = approval_info[1][1][1][0]

  # Output
  print(f"Name:{name}, Pronoun:{pronoun}, Email:{email}")
  print(f"Fact:{faculty}, Major:{major}, Year:{year}")
  print("Identity:",self_identity)
  print("research:",research_statement)
  print("leader:",leader_statement)
  print("Did the user agree to register:",agree_to_register)
  print("signature:",signature)
  print("date:",date)

  # turn str to list
  num_year = check_year(year)
  list_of_margin = check_margin(self_identity)

  row = ApplicationRow(
    student_name=name,
    pronouns=pronoun,
    student_email=email,
    faculty=faculty,
    major_area=major,
    year_of_study=num_year,
    indigenous=list_of_margin[0],
    racialized=list_of_margin[1],
    lgbtq2si=list_of_margin[2],
    disability=list_of_margin[3],
    first_generation=list_of_margin[4],
    international=list_of_margin[5],
    research_statement=research_statement,
    leadership_statement=leader_statement,
    received_date=None,
    sender_email="",
    attachment_filename=""
  )
  return row

# index_parse_docx("../raw.docx")
# parse_docx("../soscscholarsprogramapplication-2025-26.docx")
index_parse_docx("../soscscholarsprogramapplication-2025-26.docx")
print(index_parse_docx("../fixedcheck.docx"))


