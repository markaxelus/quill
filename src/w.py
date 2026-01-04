from __future__ import annotations
import os
import tempfile
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Iterable, Tuple

import win32com.client  # pywin32


@dataclass
class EmailAttachment:
    received: datetime
    sender_email: str
    subject: str
    attachment_path: str
    attachment_filename: str
    entry_id: str  # unique id in Outlook


class OutlookClient:
    def __init__(self):
        self.outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")

    def list_folders(self) -> List[str]:
        # basic: Inbox only. Expand later to subfolders if needed.
        return ["Inbox"]

    def get_folder_items(self, folder_name: str):
        inbox = self.outlook.GetDefaultFolder(6)  # 6 = Inbox
        if folder_name.lower() != "inbox":
            # You can expand this to traverse subfolders by name.
            raise ValueError("Only Inbox supported in this minimal version.")
        return inbox.Items

    def scan_docx_attachments(
        self,
        folder_name: str,
        subject_contains: str,
        from_date: datetime,
        max_emails: Optional[int] = None,
    ) -> Iterable[EmailAttachment]:
        items = self.get_folder_items(folder_name)

        # Sort newest first (important)
        items.Sort("[ReceivedTime]", True)

        temp_dir = os.path.join(tempfile.gettempdir(), "scholars_parser_attachments")
        os.makedirs(temp_dir, exist_ok=True)

        count = 0
        for item in items:
            try:
                received = item.ReceivedTime  # COM datetime
                if received is None:
                    continue
                if received < from_date:
                    # Since sorted newest->oldest, we can stop early
                    break

                subject = (item.Subject or "").strip()
                if subject_contains and subject_contains.lower() not in subject.lower():
                    continue

                # attachments
                atts = getattr(item, "Attachments", None)
                if not atts or atts.Count == 0:
                    continue

                sender_email = ""
                try:
                    sender_email = item.SenderEmailAddress or ""
                except Exception:
                    sender_email = ""

                entry_id = getattr(item, "EntryID", "")

                for i in range(1, atts.Count + 1):
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
                        entry_id=entry_id,
                    )

                count += 1
                if max_emails and count >= max_emails:
                    return

            except Exception:
                # Skip bad items (meeting requests, weird types, etc.)
                continue
