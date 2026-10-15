const checkboxPath = "assets/svgs/checkbox-empty.svg";
const electivePath = "assets/svgs/Elective.svg";
const genEdPath = "assets/svgs/Gen_ed.svg";
const requirementPath = "assets/svgs/Requirement.svg";

function buildPage() {
    const content = document.querySelector('.page-content');
    let _currentTable = null

    fetch('/site/sample_data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            for (const [yearKey, yearValue] of Object.entries(data)) {
                // these should be objects with key year, and semester object 
                for (const [semesterKey, semesterValue] of Object.entries(yearValue)) {
                    _currentTable = createSemesterBlock(semesterKey)
                    
                    // each semester should hold an array of courses
                    for (const [itemKey, itemValue] of Object.entries(semesterValue)) {
                        // each item holds an array of dictionaries (each containg course info)

                        for (const course of itemValue) {
                            // create a td for class_code, course_name, credit_hours, preferred_times, course_length, and add badges from course_type
                            if (course.type != "course") {
                                continue;
                            }

                            const row = createTableRow(_currentTable);
                            
                            addTableData(row, buildCheckbox());
                            addTableData(row, buildCourseName(course.class_code, course.course_name));
                            addTableData(row, buildTextSpan(course.credit_hours + " Credits"));
                            addTableData(row, buildTextSpan(course.preferred_times));
                            addTableData(row, buildTextSpan(course.course_length));
                            addTableData(row, buildBadges(course.course_type));
                        }
                    }
                }
            }

            // move the footer to the bottom
            const footer = document.getElementById("footer");
            content.appendChild(footer);

            // scale the page down to fit
            scaleToFit();
        })
        .catch(error => console.error('Error loading JSON:', error));

    function createSemesterBlock(name) {
        const newBlock = document.createElement("div");
        newBlock.classList.add("semester-block");
        content.appendChild(newBlock);

        const blockTitle = document.createElement("div");
        blockTitle.classList.add("semester-block-header");
        blockTitle.textContent = name;
        newBlock.appendChild(blockTitle);

        const blockTable = document.createElement("table");
        newBlock.appendChild(blockTable);
        
        return blockTable;
    }

    function createTableRow(table) {
        const newRow = document.createElement("tr");
        table.appendChild(newRow);

        return newRow;
    }

    function addTableData(tableRow, content) {
        const tableData = document.createElement("td");
        tableData.appendChild(content);
        tableRow.appendChild(tableData);

        return tableData;
    }

    function buildCheckbox() {
        const checkboxDiv = document.createElement("div");
        checkboxDiv.classList.add("checkbox");

        const checkboxImg = document.createElement("img");
        checkboxImg.src = checkboxPath;
        checkboxImg.alt = "";
        checkboxDiv.appendChild(checkboxImg);

        return checkboxDiv;
    }

    function buildCourseName(classCode, courseName) {
        const courseDiv = document.createElement("div");
        courseDiv.classList.add("course-name");

        const classCodeSpan = document.createElement("span");
        classCodeSpan.classList.add("class-code");
        classCodeSpan.textContent = classCode + ": ";
        courseDiv.appendChild(classCodeSpan);

        const courseNameSpan = document.createElement("span");
        courseNameSpan.textContent = courseName;
        courseDiv.appendChild(courseNameSpan);

        return courseDiv;
    }

    function buildTextSpan(text) {
        const span = document.createElement("span");
        span.textContent = text;

        return span;
    }

    function buildBadges(courseType) {
        const badgePaths = {
            "General Education": genEdPath,
            "Elective": electivePath,
            "Core Course": requirementPath
        };
        
        const badges = document.createElement("div");
        badges.classList.add("badges");
        
        if (courseType == null) return badges;

        // right now the value of courseType is a comma separated string,
        // but I will change the converter to output an array instead.
        for (const type of courseType) {
            // console.log(type);
            if (Object.hasOwn(badgePaths, type)) {
                // console.log(badgePaths[type]);
                const badge = createBadge(badgePaths[type]);
                badges.appendChild(badge);
            }
        }

        return badges;

        function createBadge(imagePath) {
            const badge = document.createElement("img");
            badge.classList.add("badge");
            badge.src = imagePath;
            badge.alt = "";

            return badge;
        }
    }
}

function scaleToFit() {
    const page = document.querySelector('.page');
    const content = document.querySelector('.page-content');
    const header = document.querySelector('.page-header');

    content.style.zoom = 1;

    // 1056px is 11 inches, then subtract header height and bottom padding
    const availableHeight = 1056 - header.clientHeight - 50;
    const contentHeight = content.scrollHeight;

    if (contentHeight > availableHeight) {
        const scaleRatio = availableHeight / contentHeight;
        content.style.zoom = scaleRatio;
    }
}
