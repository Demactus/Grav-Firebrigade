function copyToClipboard(index) {
    const baseUrl = window.location.origin + window.location.pathname;
    const fullLink = baseUrl + "#video-card-" + index;

    navigator.clipboard.writeText(fullLink)
        .then(() => {
            showTooltip(index, 'Kopiert!');
        })
        .catch(err => {
            console.error('Failed to copy link: ', err);
        });
}

function showTooltip(index, text) {
    const tooltip = document.getElementById(index + '-tooltip');
    tooltip.textContent = text;
    tooltip.setAttribute('data-show', '');

    setTimeout(() => {
        tooltip.removeAttribute('data-show');
    }, 150);
}