import sys
import json
import os
import traceback
from datetime import datetime
from typing import List, Dict, Any

# Ensure we can import from local modules
sys.path.append(os.path.dirname(__file__))

from outlook_client import OutlookClient
from docx_parser import index_parse_docx
from export_excel import export_rows_to_excel
from models import ApplicationRow

def send_response(data: Any):
  print(json.dumps(data), flush=True)

def handle_scan(payload: Dict[str, Any]):
  folder = payload.get("folder", "Inbox")
  subject_filter = payload.get("subject", "")
  from_date_str = payload.get("fromDate", "2026-01-01")
  
  try:
    from_date = datetime.strptime(from_date_str, "%Y-%m-%d")
  except ValueError:
    from_date = datetime(2026, 1, 1)

  client = OutlookClient()
  results = []
  
  try:
    # Scan for attachments
    attachments = client.scan_docx_attachments(folder, subject_filter, from_date)
    
    for idx, att in enumerate(attachments):
      results.append({
        "id": att.entry_id, 
        "date": att.received.isoformat(),
        "sender": att.sender_email,
        "subject": att.subject,
        "attachment": att.attachment_filename,
        "path": att.attachment_path,
        "status": "ready"
      })
          
    send_response({"status": "success", "data": results})
  except Exception as e:
    send_response({"status": "error", "message": str(e), "trace": traceback.format_exc()})

def handle_process(payload: Dict[str, Any]):
  items = payload.get("items", [])
  output_path = payload.get("outputPath", "output.xlsx")
  
  processed_rows: List[ApplicationRow] = []
  failed_items = []
  
  total = len(items)
  
  for idx, item in enumerate(items, 1):
    # Notify progress
    send_response({
      "type": "progress",
      "current": idx,
      "total": total,
      "item": item
      })
      
    try:
      path = item.get("path")
      if not path or not os.path.exists(path):
        raise FileNotFoundError(f"File not found: {path}")
      
      # Use the parser
      # Note: docx_parser currently might not return a dict (work in progress)
      try:
        data = index_parse_docx(path)
        
        # Create ApplicationRow
        row = ApplicationRow()
              
        # If parser returns data, map it. Otherwise we just have empty student data
        if isinstance(data, dict):
          row.student_name = data.get("name", "")
          row.pronouns = data.get("pronoun", "")
          row.student_email = data.get("email", "")
          row.faculty = data.get("faculty", "")
          row.major_area = data.get("major", "")
          row.year_of_study = data.get("year", "")
          row.research_statement = data.get("research_statement", "")
          row.leadership_statement = data.get("leader_statement", "")
        
        # Metadata from email is always available
        date_str = item.get("date")
        if date_str:
          row.received_date = datetime.fromisoformat(date_str)
        row.sender_email = item.get("sender", "")
        row.attachment_filename = item.get("attachment", "")
              
        processed_rows.append(row)
          
      except Exception as parse_error:
        # If parsing crashes, we fail the item
        raise Exception(f"Parsing error: {str(parse_error)}")
          
      except Exception as e:
        failed_items.append({
          "name": item.get("sender"), 
          "reason": str(e)
          })
          
  # Export
  try:
    if processed_rows:
      export_rows_to_excel(processed_rows, output_path)
          
    send_response({
      "type": "complete",
      "summary": {
        "totalProcessed": total,
        "successful": len(processed_rows),
        "skipped": len(failed_items),
        "skippedItems": failed_items,
        "outputPath": output_path
      }
    })
  except Exception as e:
    send_response({"status": "error", "message": f"Export failed: {e}"})

def main():
  # Read stdin line by line
  for line in sys.stdin:
    if not line:
      continue
    try:
      req = json.loads(line)
      command = req.get("command")
      payload = req.get("payload", {})
          
      if command == "scan":
        handle_scan(payload)
      elif command == "process":
        handle_process(payload)
      elif command == "ping":
        send_response({"status": "pong"})
      else:
        send_response({"status": "error", "message": f"Unknown command: {command}"})
    except json.JSONDecodeError:
      send_response({"status": "error", "message": "Invalid JSON"})
    except Exception as e:
      send_response({"status": "error", "message": str(e), "trace": traceback.format_exc()})

if __name__ == "__main__":
  main()
