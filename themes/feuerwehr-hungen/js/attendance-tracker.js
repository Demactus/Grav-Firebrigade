import { jsYaml } from './components/js-yaml.js';
import Timepicker from "./bundle/bundledTimepicker.js";
import { buildCharts } from "./attendance-charts.js";

//const attendeeList = ["Brinster, Jonas", "Frutig, Patrick", "Haaf, Bastian", "Hötterges, Mattheo", "Imig, Alexander", "Kießwetter, Jörg", "Klös, Sascha", "Martens, Jan", "Pfeil, Johannes", "Reipold, Pascal", "Reitz, Gerald", "Reitz, Gerrit", "Roth, Florian", "Sandner, Manuel", "Schmidt, Robin", "Tag, Dominik", "Tag, Oliver", "Thiedemann, Alex", "Thiedemann, André", "Kargoscha, Cyrus", "Derbyshirr, Reilly"];
let currentBest;
let currentSum;
document.addEventListener("DOMContentLoaded", async function () {

    const filteredEvents = loadICSData();

    const dropdown = document.getElementById("event-dropdown");
    const createButton = document.getElementById("createEventButton");
    createButton.addEventListener("click", function () {
        createNewEvent(dropdown);
    });

    // Load existing attendance data and
    let response = await loadAttendanceStats();
    let attendanceMap = response ? new Map(Object.entries(response)) : new Map();

    let attendeeStatus = calcAttendeeStats(attendanceMap);
    // Fill dropdown with ics events and (if existing) own created events
    fillDropdown(dropdown, filteredEvents, attendanceMap);

    // Pre-fill checkboxes and time inputs if available
    updateEventCard(attendanceMap, attendeeStatus);
    // Update the date when the dropdown selection changes
    dropdown.addEventListener("change", function (){
        updateEventCard(attendanceMap, attendeeStatus);
    });

    // Build charts
    let attendanceData = response ? Object.values(response) : [];
    buildCharts(attendanceData, currentSum);

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

function updateEventCard(attendanceData, attendeeStatus) {
    const selectedOption = document.getElementById("event-dropdown").value;
    const eventName = selectedOption.split(" (")[0];
    const eventDate = selectedOption.split(" (")[1].replace(")", "");

    const key = eventName.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + eventDate.replace(/[^a-zA-Z0-9_-]/g, '_');
    const event = attendanceData.get(key);

    if (event) {
        const [startHours, startMinutes] = event.startTime.split(":");
        const [endHours, endMinutes] = event.endTime.split(":");


        const ueInput = document.getElementById('ue-input');
        ueInput.value = event.ue;

        // Get all checkboxes
        const checkboxes = document.querySelectorAll(".checkbox__input");

        // Loop through checkboxes to collect their states
        checkboxes.forEach((checkbox, index) => {
            const label = document.querySelector(`label[for="${checkbox.id}"] .checkbox__label`);
            const outerLabel = document.querySelector(`label[for="${checkbox.id}"]`);
            const participantName = label ? label.textContent.trim() : `${index + 1}`;

            // Add traffic lights for status
            const previousIcon = outerLabel.querySelector(".fa-solid");
            if (previousIcon) outerLabel.removeChild(previousIcon);

            const icon = document.createElement("i");
            icon.classList.add("fa-solid", "fa-xl");
            if (currentBest[0] == participantName) {
                icon.classList.add("fa-crown");
                icon.style.color = "#D3AF37";
            } else {
                icon.classList.add("fa-traffic-light");
                icon.style.color = attendeeStatus.get(participantName);
            }
            outerLabel.insertBefore(icon, outerLabel.firstChild);

            checkbox.checked = false;

            const attendanceMap = event.attendance.reduce((accumulatorMap, currentObject) => {
                const [name, attended] = Object.entries(currentObject)[0];
                accumulatorMap.set(name, attended);
                return accumulatorMap;
            }, new Map());

            // Set the checkbox state based on attendance data
            checkbox.checked = attendanceMap.get(participantName) || false;

        });

        // Set the instructors
        const instructorOptions = Array.from(document.querySelectorAll('#instructor-dropdown option'));
        event.instructor.forEach(instructor => {
            instructorOptions.find(o => o.value == instructor).selected = true;
        });

        // Set timepickers
        updateDateDisplay(startHours, startMinutes, endHours, endMinutes);
    } else {
        const datePart = selectedOption.split(" (")[1]?.split(")")[0] || "";
        const startTime = datePart.split(", ")[1]?.trim() || "";
        const endTime = selectedOption.split("[")[1]?.replace("]", "") || "";

        const [startHours, startMinutes] = startTime.split(":");
        const [endHours, endMinutes] = endTime.split(":");

        // Reset checkboxes if no event is found
        const checkboxes = document.querySelectorAll(".checkbox__input");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset timepickers
        updateDateDisplay(startHours, startMinutes, endHours, endMinutes);
    }

}




// Function to update the date display
function updateDateDisplay(startHours, startMinutes, endHours, endMinutes) {
    if (document.getElementById("startTime-container").firstChild) {
        document.getElementById("startTime-container").removeChild(document.getElementById("startTime-container").firstChild);
    }
    if (document.getElementById("endTime-container").firstChild) {
        document.getElementById("endTime-container").removeChild(document.getElementById("endTime-container").firstChild);
    }

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
    const startTime = document.getElementById("startTime-input").value;
    const endTime = document.getElementById("endTime-input").value;


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
            startTime: startTime,
            endTime: endTime,
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

function calcAttendeeStats(attendanceMap) {

    let attendeeMap = new Map();
    let attendeeStatus = new Map();
    let ueSum = 0.0;
    attendanceMap.forEach((event => {
        ueSum = ueSum + parseFloat(event.ue);
        event.attendance.forEach(participant => {
            const name = Object.keys(participant)[0];

            if (participant[name]) {
                if (attendeeMap.has(name)) {
                    attendeeMap.set(name, parseFloat(attendeeMap.get(name)) + parseFloat(event.ue));
                } else {
                    attendeeMap.set(name, parseFloat(event.ue));
                }
            }


        });
    }));

    /** Set ue sum for later **/
    currentSum = ueSum;

    // calc attendance status
    attendeeMap.forEach((ue, name) => {
        if ((ue / (ueSum / 100)) > 60) {
            attendeeStatus.set(name, "green");
        } else if ((ue / (ueSum / 100)) > 40) {
            attendeeStatus.set(name, "#f1c405");
        } else {
            attendeeStatus.set(name, "red");
        }
    });

    currentBest = [...attendeeMap.entries()].reduce((a, e) => e[1] > a[1] ? e : a);

    return attendeeStatus;
}

function loadICSData() {
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
    return filteredEvents.reverse();
}

function fillDropdown(dropdown, events) {
    const currentDate = new Date();

    //const eventName = selectedOption.split(" (")[0];
    //const eventDate = selectedOption.split(" (")[1].replace(")", "");

    //const key = eventName.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + eventDate.replace(/[^a-zA-Z0-9_-]/g, '_');

    events.forEach(event => {
        let splitDate = event.date.split(',');
        const option = document.createElement("option");
        option.textContent = `${event.summary} (${splitDate[0]})`;
        option.value = `${event.summary} (${event.date})[${event.endTime}]`;
        dropdown.appendChild(option);

        if (event.date === currentDate) {
            option.selected = true;
        }

        dropdown.appendChild(option);

        const key = event.summary.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + event.date.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + event.endTime.replace(/[^a-zA-Z0-9_-]/g, '_');


    });
}

function createNewEvent(dropdown) {
    dropdown.insertBefore(
        new Option("Neues Event", "Neues Event"),
        dropdown.firstChild
    );
}

async function loadAttendanceStats() {
    return fetch('/user/load_attendance.php', {headers: {'Content-Type': 'application/json'}})
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error("Error fetching orders:", error);
        });
}