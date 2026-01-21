import os
import tempfile
from dataclasses import dataclass
from typing import List, Optional, Iterable, Tuple
from datetime import datetime

try:
    import win32com.client
    HAS_OUTLOOK = True
except ImportError:
    HAS_OUTLOOK = False

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
    self.outlook = None
    if HAS_OUTLOOK:
        try:
            self.outlook = win32com.client.Dispatch("Outlook.Application").getNameSpace("MAPI")
        except Exception:
            self.outlook = None

  def get_folder_items(self, folder_name: str):
    if not self.outlook:
        return []
    inbox = self.outlook.GetDefaultFolder(INBOX_FOLDER)
    return inbox.Items
  
  def get_current_user_email(self):
    if not self.outlook:
        return "Not available (Local Mode)"
    try:
      # Try to get the first account
      if self.outlook.Accounts.Count > 0:
        return self.outlook.Accounts.Item(1).SmtpAddress
      return self.outlook.CurrentUser.Address
    except Exception:
      return "Unknown"
  
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
        # Ensure received is naive for comparison
        received = received.replace(tzinfo=None)
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
      
      
    
  def scan_local_folder(self, folder_path: str) -> Iterable[EmailAttachment]:
    """
    Scans a local directory for .docx files and yields them as EmailAttachment objects.
    This allows manual uploads (e.g. on Mac/Linux or if Outlook is down).
    """
    if not os.path.exists(folder_path):
        return

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".docx"):
            file_path = os.path.join(folder_path, filename)
            # Use file stats for 'received' date as a proxy
            stats = os.stat(file_path)
            received = datetime.fromtimestamp(stats.st_mtime)
            
            yield EmailAttachment(
                received=received,
                sender_email="local_upload",
                subject=f"Manual Upload: {filename}",
                attachment_path=file_path,
                attachment_filename=filename,
                entry_id=f"local_{filename}"
            )

if __name__ == "__main__":
    client = OutlookClient()
    if HAS_OUTLOOK and client.outlook:
        subject_contains = "SCHOLARS"
        items = client.get_folder_items("Inbox")
        account = client.outlook.Accounts.Item(1)
        for match in client.find_items(items, subject_contains):
            print(getattr(match, "SenderName", "<no sender>"), getattr(match, "Subject", "<no subject>"))
            print(getattr(account, "SmtpAddress"))
    else:
        print("Outlook not available.")

