document.addEventListener('DOMContentLoaded', () => {
    const targetDate = new Date('2025-01-01T00:00:00');
    const currentDate = new Date();
    const fireworksContainer = document.getElementById('fireworks-container');

    if (currentDate.getFullYear() === targetDate.getFullYear() &&
        currentDate.getMonth() === targetDate.getMonth() &&
        currentDate.getDate() === targetDate.getDate()) {
        fireworksContainer.style.display = 'block'; // Show fireworks
    }

     //Show fireworks for a limited time
     setTimeout(() => {
         fireworksContainer.style.display = 'none';
     }, 15000); // Hide after 15 seconds (adjust as needed)
});