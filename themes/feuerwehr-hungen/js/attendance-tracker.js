import { jsYaml } from './components/js-yaml.js';
import Timepicker from "./components/timepicker/index.js";

let eventList = new Map();

document.addEventListener("DOMContentLoaded", function () {

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

// Function to update the date display
function updateDateDisplay() {
    if (document.getElementById("startTime-container").firstChild) {
        document.getElementById("startTime-container").removeChild(document.getElementById("startTime-container").firstChild);
    }
    if (document.getElementById("endTime-container").firstChild) {
        document.getElementById("endTime-container").removeChild(document.getElementById("endTime-container").firstChild);
    }


    const selectedOption =  document.getElementById("event-dropdown").value;

    // Extract the date, start time, and end time from the selected option
    const datePart = selectedOption.split(" (")[1]?.split(")")[0] || "";
    const startTime = datePart.split(", ")[1]?.trim() || "";
    const endTime = selectedOption.split("[")[1]?.replace("]", "") || "";

    const [startHours, startMinutes] = startTime.split(":");
    const [endHours, endMinutes] = endTime.split(":");

    const startContainer = document.getElementById("startTime-container");
    const startForm = document.createElement("form");
    startForm.classList.add("mio-form");
    startContainer.appendChild(startForm);
    const selectedStartTime = {time: startHours + ":" + startMinutes};

    const startTimepicker = new Timepicker({
        label: {
            text: "Startzeit",
            for: "startTime-input",
        },
        input: {
            name: "time",
            id: "startTime-input",
            value: selectedStartTime.time,
            readOnly: false,
            format: "long",
        },
        onSelect: (time) => {
            selectedStartTime.time = time;
        },
    });
    startForm.appendChild(startTimepicker.get());


    const endContainer = document.getElementById("endTime-container");
    const endForm = document.createElement("form");
    endForm.classList.add("mio-form");
    endContainer.appendChild(endForm);
    const selectedEndTime = {time: endHours + ":" + endMinutes};

    const endTimepicker = new Timepicker({
        label: {
            text: "Endzeit",
            for: "endTime-input",
        },
        input: {
            name: "time",
            id: "endTime-input",
            value: selectedEndTime.time,
            readOnly: false,
            format: "long",
        },
        onSelect: (time) => {
            selectedEndTime.time = time;
        },
    });
    endForm.appendChild(endTimepicker.get());


    // Manuelles Auslösen des input-Events
    document.getElementById("startTime-input").addEventListener('timeChanged', calculateTimeDifference );
    // Manuelles Auslösen des input-Events
    document.getElementById("endTime-input").addEventListener('timeChanged', calculateTimeDifference );

   calculateTimeDifference();
}


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