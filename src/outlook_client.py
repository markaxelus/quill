from __future__ import annotations
import os
import tempfile
import win32com.client
from dataclasses import dataclass
from typing import List, Optional, Iterable, Tuple
from datetime import datetime

INBOX_FOLDER=6

@dataclass
class EmailAttachment:
  received: datetime
  sender_email: str
  subject: str
  attachment_path: str
  attachment_filename: str
  entry_id: str # unique id in Outlook

class OutlookClient:
  def __init__(self):
    self.outlook = win32com.client.Dispatch("Outlook.Application").getNameSpace("MAPI")

  def get_folder_items(self, folder_name: str):
    inbox = self.outlook.GetDefaultFolder(INBOX_FOLDER)
    return inbox.Items
  
  def find_items(self, items, subject_contains):
    try:
        items.Sort("[ReceivedTime]", True)
    except Exception:
        pass

    subj = (subject_contains or "").lower().strip()

    for item in items:
        try:
            subject = (getattr(item, "Subject", "") or "").strip()
            if subj and subj not in subject.lower():
                continue
            yield item
        except Exception:
            continue

    
  def scan_docx_attachments(
      self,
      folder_name:str,
      subject_contains: str,
      from_date: datetime,
      max_emails: Optional[int] =  None,
    ) -> Iterable[EmailAttachment]:

    items = self.get_folder_items(folder_name)
    found_items = self.find_items(items, subject_contains)

    temp_dir = os.path.join(tempfile.gettempdir(), "scholars_parser_attachments")
    os.makedirs(temp_dir, exist_ok=True)
  
    count = 0
    for item in found_items:
      try:
        received = item.ReceivedTime
        if received is None: 
           continue
        if received < from_date:
           break
      
        subject = (item.Subject or "").strip()
        if subject_contains and subject_contains.lower() not in subject.lower():
          continue
      
        atts = getattr(item, "Attachments", None)
        if not atts or atts.Count == 0:
           continue
        
        sender_email = ""
        try:
           sender_email = item.SenderEmailAddress or ""
        except Exception:
           sender_email = ""

        entry_id = getattr(item, "EntryID", "")
        for i in range(1, atts.Count+1):
          att = atts.Item(i)
          filename = att.FileName
          
          if not filename.lower().endswith(".docx"):
             continue
          
          save_path = os.path.join(temp_dir, f"{entry_id}_{filename}".replace(":", "_"))
          att.SaveAsFile(save_path)

          yield EmailAttachment(
             received=received,
             sender_email=sender_email,
             subject=subject,
             attachment_path=save_path,
             attachment_filename=filename,
             entry_id=entry_id
          )

        count += 1
        if max_emails and count >= max_emails:
           return
      
      except Exception:
        continue
      
      
    
if __name__ == "__main__":
    subject_contains = "SCHOLARS"
    client = OutlookClient()
    items = client.get_folder_items("Inbox")
    for match in client.find_items(items, subject_contains):
        print(getattr(match, "SenderName", "<no sender>"), getattr(match, "Subject", "<no subject>"))

