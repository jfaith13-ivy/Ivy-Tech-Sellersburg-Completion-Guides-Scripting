#!/usr/bin/env python3

import csv
import json
import re

INPUT_CSV_FILE = "/content/DUMMY Advanced  Completion Guide Template - Sheet1 (1).csv"
OUTPUT_JSON_FILE = "completion_guide.json"

TERMS = {
    "Fall 1",
    "Fall 2",
    "Spring 1",
    "Spring 2",
    "Summer"
}


FIELD_MAP = {
    "Class Code:": "class_code",
    "Name of Course:": "course_name",
    "Preferred Days:": "preferred_days",
    "Preferred Times:": "preferred_times",
    "Credit Hours:": "credit_hours",
    "Preferred Course Modality:": "preferred_modality",
    "Course Length:": "course_length",
    "Other Sections Offered:": "other_sections_offered",
    "Offered Another Semester:": "offered_another_semester",
    "Type of Course": "course_type",
    "Course Modalities Offered:": "modalities_offered",
    "Notes:": "notes"
}


def clean(value):
    if value is None:
        return ""

    return str(value).strip()


def parse_completion_guide(csv_file):

    with open(csv_file, "r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))

    result = {}

    current_year = None
    current_term = None

    row_index = 0

    while row_index < len(rows):

        row = rows[row_index]
        values = [clean(x) for x in row]

        #
        # Detect year
        #
        for cell in values:
            if re.match(r"^Year\s+\d+$", cell):
                current_year = cell
                result.setdefault(current_year, {})

        #
        # Detect term
        #
        term_found = None

        for cell in values:
            if cell in TERMS:
                term_found = cell
                break

        if term_found:

            current_term = term_found

            result[current_year][current_term] = {
                "items": []
            }

            #
            # Course section is contained in the next 12 rows
            #
            block_rows = rows[row_index:row_index + 12]

            #
            # Find every course position dynamically
            #
            first_row = block_rows[0]

            course_columns = []

            for col_index, value in enumerate(first_row):
                if clean(value) == "Class Code:":
                    course_columns.append(col_index)

            #
            # Extract course data
            #
            for start_col in course_columns:

                course = {}

                for detail_row in block_rows:

                    if start_col >= len(detail_row):
                        continue

                    label = clean(detail_row[start_col])

                    if label in FIELD_MAP:

                        value = ""

                        if start_col + 1 < len(detail_row):
                            value = clean(detail_row[start_col + 1])

                        if value:

                            key = FIELD_MAP[label]

                            #
                            # Convert selected fields to arrays
                            #
                            if key in (
                                "modalities_offered",
                                "offered_another_semester"
                            ):
                                course[key] = [
                                    x.strip()
                                    for x in value.split(",")
                                    if x.strip()
                                ]
                            else:
                                course[key] = value

                #
                # Convert credit hours to integer
                #
                if "credit_hours" in course:
                    try:
                        course["credit_hours"] = int(
                            course["credit_hours"]
                        )
                    except ValueError:
                        pass

                #
                # Ignore empty placeholders
                #
                if (
                    course.get("class_code")
                    or course.get("course_name")
                ):

                    result[current_year][current_term]["items"].append({
                        "type": "course",
                        **course
                    })

        #
        # Detect certification section
        #
        if (
            current_year
            and current_term
            and "Certifications" in values
        ):

            cert_row_idx = row_index + 1

            while cert_row_idx < len(rows):

                cert_row = [
                    clean(x)
                    for x in rows[cert_row_idx]
                ]

                row_text = " ".join(cert_row)

                #
                # Stop at next year
                #
                if re.search(r"Year\s+\d+", row_text):
                    break

                #
                # Stop at next term
                #
                if any(term in cert_row for term in TERMS):
                    break

                for cell in cert_row:

                    if (
                        cell
                        and cell != "Certifications:"
                    ):

                        result[current_year][current_term]["items"].append({
                            "type": "certification",
                            "name": cell
                        })

                cert_row_idx += 1

        row_index += 1

    return result


def main():

    input_csv = "completion_guide.csv"
    output_json = "completion_guide.json"

    data = parse_completion_guide(input_csv)

    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(
            data,
            f,
            indent=4,
            ensure_ascii=False
        )

    print(
        f"Successfully created {output_json}"
    )


if __name__ == "__main__":
    main()
