import {timePickerInput_create} from './modules/analogue-time-picker.js';
import { jsYaml } from './modules/js-yaml.js';

let eventList = new Map();

document.addEventListener("DOMContentLoaded", function () {

    const startTimeInput = document.getElementById('startTime-input');
    const endTimeInput = document.getElementById('endTime-input');

    if (!startTimeInput || !endTimeInput) {
        console.error("startTime-input oder endTime-input wurde nicht gefunden.");
        return;
    }


    // Load event data from ICS file
    const eventDataContainer = document.getElementById("event-data-container");
    const eventData = JSON.parse(eventDataContainer.getAttribute("data-list"));

    const filteredEvents = Array.isArray(eventData)
        ? eventData
            .filter(event => event.summary && event.summary.startsWith("Ausbildung"))
            .map(event => ({
               ...event,
               summary: event.summary.replace(/^Ausbildung:\s*/, "")
            }))
        : [];
    filteredEvents.reverse();

    const dropdown = document.getElementById("event-dropdown");
    const currentDate = new Date();

    filteredEvents.forEach(event => {
        eventList.set(event.summary, event.date);
        let splitDate = event.date.split(',');
        const option = document.createElement("option");
        option.textContent = `${event.summary} (${splitDate[0]})`;
        option.value = `${event.summary} (${event.date})[${event.endTime}]`;
        dropdown.appendChild(option);

        if (event.date === currentDate) {
            option.selected = true;
        }

        dropdown.appendChild(option);
    });

    // Function to update the date display
    function updateDateDisplay() {
        const selectedOption = dropdown.value;

        // Extract the date, start time, and end time from the selected option
        const datePart = selectedOption.split(" (")[1]?.split(")")[0] || "";
        const startTime = datePart.split(", ")[1]?.trim() || "";
        const endTime = selectedOption.split("[")[1]?.replace("]", "") || "";

        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        let startPicker = timePickerInput_create({
            inputElement: document.getElementById("startTime-input"),
            mode: 24,
            width: "300px",
            time: { hour: startHours, minute: startMinutes}
        });
        // Manuelles Auslösen des input-Events
        document.getElementById("startTime-input").addEventListener('timeChanged', calculateTimeDifference );

        let endPicker = timePickerInput_create({
            inputElement: document.getElementById("endTime-input"),
            mode: 24,
            width: "300px",
            time: { hour: endHours, minute: endMinutes }
        });
        // Manuelles Auslösen des input-Events
        document.getElementById("endTime-input").addEventListener('timeChanged', calculateTimeDifference );

        calculateTimeDifference();
    }
    // Initial update
    updateDateDisplay();
    // Update the date when the dropdown selection changes
    dropdown.addEventListener("change", updateDateDisplay);



    const saveAttendanceButton = document.getElementById("submitAttendanceButton");

    saveAttendanceButton.addEventListener("click", function () {
        saveAttendanceToYAML().then(success => {
            if (success) {
                alert("Attendance saved successfully!");
            } else {
                alert("Failed to save attendance.");
            }
        })
    });

});


async function saveAttendanceToYAML() {
    const title = document.getElementById("event-dropdown").value;
    const eventName = title.split(" (")[0];
    const eventDate = title.split(" (")[1].replace(")", "");
    const splitDate = eventDate.split(',');
    const ueValue = document.getElementById('ue-input').value;

    // Get all checkboxes
    const checkboxes = document.querySelectorAll(".checkbox__input");
    const attendance = [];

    // Loop through checkboxes to collect their states
    checkboxes.forEach((checkbox, index) => {
        const label = document.querySelector(`label[for="${checkbox.id}"] .checkbox__label`);
        const participantName = label ? label.textContent.trim() : `${index + 1}`;
        attendance.push({ [participantName]: checkbox.checked });

    });

    // Get instructor for session
    const options = document.getElementById('instructor-dropdown').selectedOptions;
    const instructorList = Array.from(options).map(({ value }) => value);

    const key = eventName.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + eventDate.replace(/[^a-zA-Z0-9_-]/g, '_');
    // YAML-Datenstruktur erstellen
    const yamlData = {
        [key]: {
            date: eventDate,
            eventName: eventName,
            ue: ueValue,
            instructor: instructorList,
            attendance: attendance
        }
    };

    // Convert YAML to String
    const yamlString = jsYaml.dump(yamlData);
    console.log(yamlString);
    try {
        const response = await fetch('/user/save_attendance.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `yamlData=${encodeURIComponent(yamlString)}`,
        });
        if (response.ok) {
            console.log("YAML saved successfully!");
            return true;
        } else {
            console.error('Failed to save YAML:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error saving YAML:', error);
    }

}

function calculateTimeDifference() {
    const startTime = document.getElementById('startTime-input').value;
    const endTime = document.getElementById('endTime-input').value;
    const ueInput = document.getElementById('ue-input');

    if (startTime && endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        const startDate = new Date(0, 0, 0, startHours, startMinutes);
        const endDate = new Date(0, 0, 0, endHours, endMinutes);

        let diff = (endDate - startDate) / (1000 * 60);

        if (diff < 0) {
            diff += 24 * 60;
        }

         // Calculate UE (Unterrichtseinheiten)
        ueInput.value = (diff / 45).toFixed(1);
    } else {
        ueInput.value = '';
    }
}