const terms = new Set([
    "Fall 1",
    "Fall 2",
    "Spring 1",
    "Spring 2",
    "Summer"
]);

const field_map = {
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
    "Notes:": "notes",
}

const root_field_map = {
    "Program Name": "program_name",
    "Degree Type": "degree_type",
    "Days and Times Listed?": "days_and_times_listed",
    "Is the program Limited Enrollment?": "limited_enrollment"
}

function clean(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value).trim();
}

function parseCsv(text) {
    const content = text.replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (inQuotes) {
            if (char === '"' && nextChar === '"') {
                cell += '"';
                i++;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                cell += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ",") {
                row.push(cell);
                cell = "";
            } else if (char === "\r" || char === "\n") {
                if (char === "\r" && nextChar === "\n") {
                    i++;
                }
                row.push(cell);
                rows.push(row);
                row = [];
                cell = "";
            } else {
                cell += char;
            }
        }
    }

    if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    
    return rows;
}

export async function parseCompletionGuide(csvInput) {
    // accepts either raw CSV string or browser object
    const rawContent = typeof csvInput === "string" ? csvInput : await csvInput.text();
    const rows = parseCsv(rawContent);

    const result = {};
    let currentYear = null;
    let currentTerm = null;
    let rowIndex = 0;

    while (rowIndex < rows.length) {
        const row = rows[rowIndex];
        const values = row.map(clean);
        
        // detect root fields (such as program name, program type, etc.)
        for (let i = 0; i < values.length; i++) {
            const label = values[i];

            if (label in root_field_map) {
                const key = root_field_map[label];
                const val = values[i + 2];

                if (val) {
                    if (
                        key === "days_and_times_listed" ||
                        key === "limited_enrollment"
                    ) {
                        result[key] = val.toLowerCase() === "yes"; // turns the Yes/No into a boolean
                    } else {
                        result[key] = val;
                    }
                }
            }
        }

        // detect year
        for (const cell of values) {
            if (/^Year\s+\d+$/.test(cell)) {
                currentYear = cell;
                if (!(currentYear in result)) {
                    result[currentYear] = {};
                }
            }
        }

        // detect term
        let termFound = null;
        for (const cell of values) {
            if (terms.has(cell)) {
                termFound = cell;
                break;
            }
        }

        if (termFound) {
            if (currentYear === null) {
                rowIndex += 1;
                continue;
            }

            currentTerm = termFound;
            result[currentYear][currentTerm] = [];
            
            // course section is contained in the next 12 rows
            const blockRows = rows.slice(rowIndex, rowIndex + 12);

            // find every course position dynamically
            const firstRow = blockRows[0] || [];
            const courseColumns = [];
            
            firstRow.forEach((value, colIndex) => {
                if (clean(value) === "Class Code:") {
                    courseColumns.push(colIndex);
                }
            });

            // extract course data
            for (const startCol of courseColumns) {
                const course = {};
                
                for (const detailRow of blockRows) {
                    if (startCol >= detailRow.length) {
                        continue;
                    }
                    
                    const label = clean(detailRow[startCol]);

                    if (label in field_map) {
                        let value = "";

                        if (startCol + 1 < detailRow.length) {
                            value = clean(detailRow[startCol + 1]);
                        }

                        if (value) {
                            const key = field_map[label];

                            // convert selected fields to arrays
                            if (
                                key === "modalities_offered" ||
                                key === "offered_another_semester" ||
                                key === "course_type" ||
                                key === "preferred_days"
                            ) {
                                course[key] = value
                                    .split(",")
                                    .map((x) => x.trim())
                                    .filter(Boolean);
                            } else {
                                course[key] = value;
                            }
                        }
                    }
                }

                // convert credit hours to integer
                if ("credit_hours" in course) {
                    if (/^[+-]?\d+$/.test(course.credit_hours)) {
                        course.credit_hours = parseInt(course.credit_hours, 10);
                    }
                }

                // ignore empty placeholders
                if (course.class_code || course.course_name) {
                    result[currentYear][currentTerm].push({
                        type: "course",
                        ...course
                    });
                }
            }
        }

        // detect certification section
        if (currentYear && currentTerm) {
            for (let i = 0; i < values.length; i++) {
                if (values[i] === "Certifications") {
                    const certName = values[i + 2];

                    if (certName) {
                        result[currentYear][currentTerm].push({
                            type: "certification",
                            name: certName
                        });
                    }
                }
            }
        }

        rowIndex += 1;
    }

    return result;
}