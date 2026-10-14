function generatePDF() {
    console.log('Generating PDF...');
    const element = document.querySelector('.page');
    
    const originalShadow = element.style.boxShadow;
    element.style.boxShadow = 'none';

    const opt = {
        margin: 0,
        filename: 'completion-guide.pdf',
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save().then(() => {
        element.style.boxShadow = originalShadow;
    });
}