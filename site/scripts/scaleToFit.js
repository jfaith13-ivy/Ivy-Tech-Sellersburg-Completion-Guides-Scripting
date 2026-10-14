function scaleToFit() {
    const page = document.querySelector('.page');
    const content = document.querySelector('.page-content');
    const header = document.querySelector('.page-header');

    content.style.zoom = 1;

    // 1056px is 11 inches, then subtract header height and bottom padding
    const availableHeight = 1056 - header.clientHeight - 60;
    const contentHeight = content.scrollHeight;

    if (contentHeight > availableHeight) {
        const scaleRatio = availableHeight / contentHeight;
        content.style.zoom = scaleRatio;
    }
}