import { parseCompletionGuide } from "./convert.js";

const dropzoneContainer = document.getElementById("cv-drop-zone");
const fileInput = document.getElementById("cv-upload");

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file.name.endsWith(".csv")) {
        convert(file);
    }
});

// stop the cursor from showing the plus icon when file is being dragged over blank space
window.addEventListener("dragover", (e) => {
    if (!dropzoneContainer.contains(e.target)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "none";
    }
});

window.addEventListener("drop", (e) => {
    if (!dropzoneContainer.contains(e.target)) {
        e.preventDefault();
    }
});

dropzoneContainer.addEventListener("dragover", (e) => {
    e.preventDefault()

    const isValid = Array.from(e.dataTransfer.items).every(item => {
        return item.kind === "file" && item.type === "text/csv";
    })

    if (isValid) {
        e.dataTransfer.dropEffect = "copy";
        dropzoneContainer.classList.add("dragging");
    } else {
        e.dataTransfer.dropEffect = "none";
        dropzoneContainer.classList.add("dragging-invalid");
    }
});

dropzoneContainer.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzoneContainer.classList.remove("dragging");

    const file = e.dataTransfer.files[0];

    if (file && file.name.endsWith(".csv")) {
        convert(file);
    }
});

dropzoneContainer.addEventListener("dragleave", (e) => {
    dropzoneContainer.classList.remove("dragging");
    dropzoneContainer.classList.remove("dragging-invalid");
});

async function convert(file) {
    const jsonData = await parseCompletionGuide(file);
    sessionStorage.setItem("csvData", JSON.stringify(jsonData));
    window.location.href = "guide.html";
}
