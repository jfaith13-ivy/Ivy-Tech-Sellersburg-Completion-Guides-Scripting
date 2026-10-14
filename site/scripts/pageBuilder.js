
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
                            createTableRow();
                            
                        }
                    }
                }
            }
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

    function createTableRow() {
        const newRow = document.createElement("tr");
        _currentTable.appendChild(newRow);
    }
}
