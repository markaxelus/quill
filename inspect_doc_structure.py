from docx2python import docx2python
import sys

def inspect_docx(path):
    try:
        doc = docx2python(path)
        print(f"Document Body Length: {len(doc.body)}")
        
        for i, table in enumerate(doc.body):
            print(f"\n--- Top Level Item {i} ---")
            # docx2python structure: body -> tables -> rows -> cells -> paragraphs -> runs
            # We want to see what's inside.
            
            # Check if it looks like a table (list of lists of lists)
            if isinstance(table, list) and len(table) > 0 and isinstance(table[0], list):
                print(f"Type: Table ({len(table)} rows)")
                for r_idx, row in enumerate(table):
                    print(f"  Row {r_idx}:")
                    for c_idx, cell in enumerate(row):
                         # Flatten cell content
                        text = "".join(
                            run for paragraph in cell for run in paragraph
                        )
                        print(f"    Cell {c_idx}: {repr(text)}")
            else:
                 # It might be just a paragraph structure if not a table
                 print(f"Type: Paragraph/Content")
                 # Try to flatten if possible
                 try:
                     text = "".join(run for paragraph in table for run in paragraph)
                     print(f"Content: {repr(text)}")
                 except:
                     print(f"Raw content: {table}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Redirect stdout to a file with utf-8 encoding
    with open("structure.log", "w", encoding="utf-8") as f:
        sys.stdout = f
        inspect_docx("soscscholarsprogramapplication-2025-26.docx")
