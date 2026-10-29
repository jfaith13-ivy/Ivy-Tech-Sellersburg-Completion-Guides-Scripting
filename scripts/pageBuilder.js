const checkboxPath = "assets/svgs/checkbox-empty.svg";
const electivePath = "assets/svgs/Elective.svg";
const genEdPath = "assets/svgs/Gen_ed.svg";
const requirementPath = "assets/svgs/Requirement.svg";
const dualCreditPath = "assets/svgs/DC.svg";

const groupedSemesters = {
    "Fall": ["Fall 1", "Fall 2"],
    "Spring": ["Spring 1", "Spring 2"],
    "Summer": ["Summer"]
}

function buildPage() {
    const content = document.querySelector('.page-content');
    const storedData = sessionStorage.getItem("csvData");

    if (storedData) {
        const data = JSON.parse(storedData);

        try{
            setName(data.program_name, data.degree_type);
        }
        catch(e) {
        }

        for (const [yearKey, yearValue] of Object.entries(data)) {
            let semesters = {}; // for grouping (e.g. "Fall 1" and "Fall 2" are grouped into "Fall")
            // these should be objects with key year, and value array of semester items
            for (const [semesterKey, semesterValue] of Object.entries(yearValue)) {
                const matchedKey = Object.keys(groupedSemesters).find(key => groupedSemesters[key].includes(semesterKey));
                if (matchedKey) {
                    if (!semesters[matchedKey]) {
                        semesters[matchedKey] = [];
                    }
                    for (course of semesterValue) {
                        semesters[matchedKey].push(course);
                    }
                }
            }
            for (const [semesterKey, semesterValue] of Object.entries(semesters)) {
                if (semesterValue.length == 0) {
                    // don't add semester or degree blocks if there are no courses or certs
                    continue;
                }
                const _currentTable = createSemesterBlock(semesterKey);
                const _degreeContainer = createDegreeContainer() ;
                
                // each semester should hold an array of courses
                for (const [, course] of Object.entries(semesterValue)) {
                    // create a td for class_code, course_name, credit_hours, preferred_times, course_length, and add badges from course_type
                    if (course.type == "course") {
                        const row = createTableRow(_currentTable);
                        
                        addTableData(row, buildCheckbox());
                        addTableData(row, buildCourseName(course.class_code, course.course_name));
                        addTableData(row, buildTextSpan(course.credit_hours + " Credits"));
                        addTableData(row, buildTextSpan(course.preferred_times));
                        addTableData(row, buildTextSpan(course.course_length));
                        addTableData(row, buildBadges(course.course_type));
                    }
                    
                    if (course.type == "certification") {
                        buildCertBlock(_degreeContainer, course.name);
                    }
                }
            }
        }

        // move the footer to the bottom
        const footer = document.getElementById("footer");
        content.appendChild(footer);

        // scale the page down to fit
        scaleToFit();
    } else {
        window.location.href = "/";
    }

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

    function createDegreeContainer() {
        const degrees = document.createElement("div");
        degrees.classList.add("degree-boxes");
        content.appendChild(degrees);

        return degrees;
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

    function buildCertBlock(certContainer, name) {
        const block = document.createElement("div");
        block.textContent = name;
        block.classList.add("degree-box");
        certContainer.appendChild(block);

    }

    function buildTextSpan(text) {
        const span = document.createElement("span");
        span.textContent = text;

        return span;
    }

    function buildBadges(courseType) {
        // first item is the path for the badge on the course row
        // second item is the id for showing in the legend
        const badgePaths = {
            "General Education": [genEdPath, "legend-general-badge"],
            "Elective": [electivePath, "legend-elective-badge"],
            "Pre-Requisite for Program Admission": [requirementPath, "legend-required-badge"],
            "Dual Credit": [dualCreditPath, "legend-dual-credit-badge"]
        };
        
        const badges = document.createElement("div");
        badges.classList.add("badges");
        
        if (courseType == null) return badges;

        // right now the value of courseType is a comma separated string,
        // but I will change the converter to output an array instead.
        // currently using a sample where I manually swapped the strings to arrays.
        for (const type of courseType) {
            if (Object.hasOwn(badgePaths, type)) {
                const badge = createBadge(badgePaths[type][0]);
                badges.appendChild(badge);

                // show legend badge
                const legend = document.getElementById(badgePaths[type][1])
                legend.style.display = "flex";

                // show legend bar
                const legendBar = document.getElementById("icon-legend-bar")
                legendBar.style.display = "flex";
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

    function setName(degreeName, degreeType) {
        const titleContainer = document.getElementById("title-container");
        const titleFirstWords = document.getElementById("title-first-words");
        const titleLastWord = document.getElementById("title-last-word");
        const titleDegreeType = document.getElementById("degree-type");
        const pageTitle = document.getElementById("page-title");

        const words = degreeName.split(/\s+/); // split at spaces
        if (words.length > 1) {
            const firstWords = words.slice(0, -1).join(" ").toUpperCase();
            const lastWord = words.at(-1).toUpperCase();

            titleFirstWords.textContent = firstWords;
            titleLastWord.textContent = lastWord;
        }
        else {
            titleFirstWords.textContent = degreeName.toUpperCase();
            titleLastWord.textContent = "";
        }

        titleDegreeType.textContent = degreeType;

        // this is also what the printed file name will default to
        const titleCaseName = degreeName
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        document.title = titleCaseName + " - " + degreeType;

        if (titleContainer.offsetHeight > 50) {
            titleContainer.classList.add("small-name");
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
