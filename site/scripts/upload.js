const dropzoneContainer = document.getElementById("cv-drop-zone")
const fileInput = document.getElementById("cv-upload")

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0]
    if (file.name.endsWith(".csv")) {
        convert(file)
    }
})

dropzoneContainer.addEventListener("dragover", (e) => {
    e.preventDefault()

    const isValid = Array.from(e.dataTransfer.items).every(item => {
        return item.kind === "file" && item.type === "text/csv";
    })

    if (isValid) {
        dropzoneContainer.classList.add("dragging")
    } else {
        dropzoneContainer.classList.add("dragging-invalid")
    }
})

dropzoneContainer.addEventListener("drop", (e) => {
    e.preventDefault()
    dropzoneContainer.classList.remove("dragging")

    const file = e.dataTransfer.files[0];

    if (file && file.name.endsWith(".csv")) {
        convert(file)
    }
})

dropzoneContainer.addEventListener("dragleave", (e) => {
    dropzoneContainer.classList.remove("dragging")
    dropzoneContainer.classList.remove("dragging-invalid")
})

function convert(file) {
    console.log(file.name)

    fetch('/site/sample_data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(jsonData => {
            sessionStorage.setItem("csvData", JSON.stringify(jsonData));
            window.location.href="guide.html";
        });
}