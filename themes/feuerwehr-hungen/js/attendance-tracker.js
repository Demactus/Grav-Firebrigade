document.addEventListener("DOMContentLoaded", function () {
    const eventDataContainer = document.getElementById("event-data-container");
    const eventData = JSON.parse(eventDataContainer.getAttribute("data-list"));

    console.log(eventData);

    const filteredEvents = Array.isArray(eventData)
        ? eventData
            .filter(event => event.summary && event.summary.startsWith("Ausbildung"))
            .map(event => ({
               ...event,
               summary: event.summary.replace(/^Ausbildung:\s*/, "")
            }))
        : [];
    filteredEvents.reverse();

    console.log(filteredEvents);
    const dropdown = document.getElementById("event-dropdown");
    const currentDate = new Date();

    filteredEvents.forEach(event => {
        const option = document.createElement("option");
        option.textContent = `${event.summary} (${event.date})`;
        option.value = `${event.summary} (${event.date})`;
        dropdown.appendChild(option);

        if (event.date === currentDate) {
            option.selected = true;
        }

        dropdown.appendChild(option);
    });



    const saveAttendanceButton = document.getElementById("submitAttendanceButton");

    saveAttendanceButton.addEventListener("click", function () {
        saveAttendanceToCSV().then(success => {
            if (success) {
                alert("Attendance saved successfully!");
            } else {
                alert("Failed to save attendance.");
            }
        })
    });

});

async function saveAttendanceToCSV() {
    const title = document.getElementById("event-dropdown").value;
    const eventName = title.split(" (")[0];
    const eventDate = title.split(" (")[1].replace(")", "");

    // Get all checkboxes
    const checkboxes = document.querySelectorAll(".checkbox__input");

    const csvRows = [];
    const headerRow = ["event"]; // First column header
    const dataRow = [eventName]; // First column data

    // Loop through checkboxes to collect their states
    checkboxes.forEach((checkbox, index) => {
        const label = document.querySelector(`label[for="${checkbox.id}"] .checkbox__label`);
        const columnName = label ? label.textContent.trim() : `Checkbox ${index + 1}`;
        headerRow.push(columnName);
        dataRow.push(checkbox.checked ? "true" : "false");
    });

    // Add header and data rows to CSV
    csvRows.push(headerRow.join(","));
    csvRows.push(dataRow.join(","));

    // Convert CSV array to a string
    const csvData = csvRows.join("\n");

    const filename = `${eventName}-${eventDate}`;

    try {
        const response = await fetch('/user/save_attendance.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `csvData=${encodeURIComponent(csvData)}&filename=${encodeURIComponent(filename)}.csv`,
        });
        if (response.ok) {
            console.log("CSV saved successfully!");
            return true;
        } else {
            console.error('Failed to save CSV:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error saving CSV:', error);
    }

}