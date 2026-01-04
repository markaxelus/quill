from __future__ import annotations
import os
import tempfile
import win32com.client
from typing import List, Optional, Iterable, Tuple

INBOX_FOLDER=6

class OutlookClient:
  def __init__(self):
    self.outlook = win32com.client.Dispatch("Outlook.Application").getNameSpace("MAPI")

  def get_folder_items(self, folder_name):
    inbox = self.outlook.GetDefaultFolder(INBOX_FOLDER)
    return inbox.items
  
  def find_items(self, items):
    try: 
      items.Sort("[ReceivedTime]", True)
    except Exception:
      pass
    
    query = "@SQL=\"urn:schemas:httpmail:subject\" like '%scholars%'"
    filtered_items = items.Restrict(query)
    match = filtered_items.GetFirst()
    index = 1
    while match:
      subject = getattr(match, "Subject", "<no subject>")
      sender = getattr(match, "SenderName", "<no sender>")
      received = getattr(match, "ReceivedTime", "<no received time>")
      print(f"{index}. {received} | {sender} | {subject}")
      match = filtered_items.GetNext()
      index += 1 
    


if __name__ == "__main__":
  client = OutlookClient()
  items = client.get_folder_items('Inbox')
  client.find_items(items)
