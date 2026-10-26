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
    dropzoneContainer.classList.add("dragging")
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
})

function convert(file) {
    console.log(file.name)

    fetch('/site/sample_data2.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(jsonData => {
            sessionStorage.setItem("csvData", JSON.stringify(jsonData));
            window.location.href="guide.html";
        });
}