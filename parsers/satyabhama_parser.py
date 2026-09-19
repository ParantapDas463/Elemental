import csv
import os
from bs4 import BeautifulSoup

# 1. Provide the exact filename you sent
file_path = "C:/Users/PARANTAP DAS/OneDrive/Desktop/!DOCTYPE html.txt"

try:
    with open(file_path, "r", encoding="utf-8") as file:
        html_content = file.read()
except FileNotFoundError:
    print(
        f"Error: Could not find the file '{file_path}'. Please make sure it's in the same folder."
    )
    exit()

soup = BeautifulSoup(html_content, "html.parser")

# 2. Target the main data table
table = soup.find("table", {"id": "gvRegisteredProjectDetailsWithoutSearch"})

project_records = []

if table:
    # Find all table rows, skip the header row
    data_rows = table.find_all("tr")[1:]

    for row in data_rows:
        cells = row.find_all("td")
        # Ensure it's a valid data row with all expected columns
        if len(cells) < 10:
            continue

        # Extract individual simple fields by index
        s_no = cells[0].get_text(strip=True)
        project_no = cells[1].get_text(strip=True)
        title = cells[2].get_text(strip=True)

        # Break down multi-line column: PI Details (Index 3)
        pi_strings = [text.strip() for text in cells[3].stripped_strings]
        pi_name = pi_strings[0] if len(pi_strings) > 0 else ""
        department = pi_strings[1] if len(pi_strings) > 1 else ""
        designation = pi_strings[2] if len(pi_strings) > 2 else ""

        # Break down multi-line column: Institute Details (Index 4)
        inst_strings = [text.strip() for text in cells[4].stripped_strings]
        institute = inst_strings[0] if len(inst_strings) > 0 else ""
        mobile = inst_strings[1] if len(inst_strings) > 1 else ""

        # Extract remaining fields
        org_type = cells[5].get_text(strip=True)
        submission_date = cells[6].get_text(strip=True)
        total_budget = cells[7].get_text(strip=True)
        approved_budget = cells[8].get_text(strip=True)

        # Status field often has a status text + a date label underneath
        status_text = cells[9].get_text(" ", strip=True)

        # Put everything into a clean row mapping
        record = {
            "S.No.": s_no,
            "Project Number": project_no,
            "Title of The Projects": title,
            "PI Name": pi_name,
            "Department": department,
            "Designation": designation,
            "PI Institute": institute,
            "Mobile No": mobile,
            "Organisation Type": org_type,
            "Date of Project Submission": submission_date,
            "Total Budget": total_budget,
            "Approved Budget": approved_budget,
            "Status": status_text,
        }
        project_records.append(record)

# 3. Save everything straight into a structured CSV file
output_dir = "data/processed/satyabhama"
output_filename = "registered_projects_extracted_page_24.csv"
output_csv_path = os.path.join(output_dir, output_filename)

# === THE FIX: Automatically create the folder paths before writing file ===
os.makedirs(output_dir, exist_ok=True)

csv_columns = [
    "S.No.",
    "Project Number",
    "Title of The Projects",
    "PI Name",
    "Department",
    "Designation",
    "PI Institute",
    "Mobile No",
    "Organisation Type",
    "Date of Project Submission",
    "Total Budget",
    "Approved Budget",
    "Status",
]

try:
    with open(output_csv_path, "w", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
        writer.writeheader()
        for row_data in project_records:
            writer.writerow(row_data)
    print(
        f"Success! Extracted {len(project_records)} project rows into '{output_csv_path}'."
    )
except IOError as e:
    # Changed to print out the real error reason if it still fails
    print(f"Error saving the CSV output file. Reason: {e}")
