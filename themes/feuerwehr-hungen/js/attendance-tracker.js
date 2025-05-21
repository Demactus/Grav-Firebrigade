import {jsYaml} from './components/js-yaml.js';
import Timepicker from "./bundle/bundledTimepicker.js";
import {buildCharts} from "./attendance-charts.js";

//const attendeeList = ["Brinster, Jonas", "Frutig, Patrick", "Haaf, Bastian", "Hötterges, Mattheo", "Imig, Alexander", "Kießwetter, Jörg", "Klös, Sascha", "Martens, Jan", "Pfeil, Johannes", "Reipold, Pascal", "Reitz, Gerald", "Reitz, Gerrit", "Roth, Florian", "Sandner, Manuel", "Schmidt, Robin", "Tag, Dominik", "Tag, Oliver", "Thiedemann, Alex", "Thiedemann, André", "Kargoscha, Cyrus", "Derbyshirr, Reilly"];
let currentBest;
let currentSum;
document.addEventListener("DOMContentLoaded", async function () {

    const filteredEvents = loadICSData();

    const dropdown = document.getElementById("event-dropdown");
    const createButton = document.getElementById("createEventButton");
    createButton.addEventListener("click", function () {
        createNewEvent(dropdown);
        dropdown.dispatchEvent(new Event("change"));
    });

    // Load existing attendance data and
    let response = await loadAttendanceStats();
    let attendanceMap = response ? new Map(Object.entries(response)) : new Map();

    // Fill dropdown with ics events and (if existing) own created events
    fillDropdownWithOrphansSorted(dropdown, filteredEvents, attendanceMap);

    let attendeeStatus = calcAttendeeStats(attendanceMap);

    // Pre-fill checkboxes and time inputs if available
    updateEventCard(attendanceMap, attendeeStatus, filteredEvents);
    // Update the date when the dropdown selection changes
    dropdown.addEventListener("change", function (){
        updateEventCard(attendanceMap, attendeeStatus, filteredEvents);
    });

    // Build charts
    let attendanceData = response ? Object.values(response) : [];
    if (!attendanceData.length == 0) {
        buildCharts(attendanceData, currentSum);
    }


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

function updateEventCard(attendanceData, attendeeStatus, filteredEvents) {
    const selectedOption = document.getElementById("event-dropdown").value;

    const event = attendanceData.get(selectedOption);
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
        // Reset checkboxes if no event is found
        const checkboxes = document.querySelectorAll(".checkbox__input");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        const icsEvent = filteredEvents.find(event => event.uid == selectedOption);
        if (icsEvent) {

            const [startHours, startMinutes] = icsEvent.startTime.split(":");
            const [endHours, endMinutes] = icsEvent.endTime.split(":");

            // Reset timepickers
            updateDateDisplay(startHours, startMinutes, endHours, endMinutes);
        } else {
            const date = new Date();
            const hours = date.getHours() > 10 ? date.getHours() : "0" + date.getHours();
            const minutes = date.getMinutes() > 10 ? date.getMinutes() : "0" + date.getMinutes();


            updateDateDisplay(hours, minutes, hours, minutes);
        }


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
    const key = document.getElementById("event-dropdown").value;

    const eventString = document.getElementById("event-dropdown").selectedOptions[0].textContent;

    const eventName = eventString.split('(')[0].trim();
    const date = eventString.split('(')[1].split(')')[0].trim();


    const startTime = document.getElementById("startTime-input").value;
    const endTime = document.getElementById("endTime-input").value;
    const eventDate = '' + date + ', ' + startTime + '[' + endTime + ']';

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
    //console.log(yamlString);
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
    if (attendanceMap.size == 0) {
        return;
    }

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

function fillDropdownWithOrphansSorted(dropdown, events, attendanceMap) {
    const unifiedDataMap = new Map();

    events.forEach(event => {
        //const sortableDate = parseEventDate(event.date);
        const dateParts = event.date.split('.');
        const isoDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const sortableDate = new Date(isoDateString);
        if (isNaN(sortableDate.getTime())) {
            console.warn(`Invalid date encountered: ${event.date}`);
         return; // Skip invalid dates
        }
        // Extract only the date part for display text
        const displaySummary = `${event.summary} (${event.date})`;

        // Create the definitive entry using event data
        const eventEntry = {
            displaySummary: displaySummary,
            sortableDate: new Date(sortableDate),
            value: event.uid,
            source: 'event'
        };

        // Add/overwrite entry in the map using the generated key
        unifiedDataMap.set(event.uid, eventEntry);
    });

    attendanceMap.forEach(((entry, key) => {
        const localDate = entry.date.split(',')[0].trim();
        const dateParts = localDate.split('.');
        const isoDateString = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const sortableDate = new Date(isoDateString);
        console.log(isoDateString);

        const displaySummary =  entry.eventName + " (" + localDate + ")";

        unifiedDataMap.set(key, {
            displaySummary: displaySummary,
            value: key,
            sortableDate: sortableDate,
            source: 'orphan'
        });
    }));

    // 3. Convert the map values (which are now deduplicated and prioritized) to an array
    const unifiedList = Array.from(unifiedDataMap.values());

    // 4. Sort the final list by date, newest first
    unifiedList.sort((a, b) => {
        const dateA = a.sortableDate;
        const dateB = b.sortableDate;
        // Handle potential null dates from parsing errors, put them last
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });

    const futureDateLimit = new Date();
    futureDateLimit.setDate(futureDateLimit.getDate() + 30);
    futureDateLimit.setHours(0, 0, 0, 0); // Set to midnight
    // 5. Filter out events newer than today
    const filteredUnifiedList = unifiedList.filter(item => {
        if (isNaN(item.sortableDate.getTime())) {
            return false;
        }
        return item.sortableDate <= futureDateLimit;
    });



    // 5. Populate the dropdown with simplified text
    dropdown.innerHTML = ''; // Clear existing options

    console.log(filteredUnifiedList);

    filteredUnifiedList.forEach(item => {
        const option = document.createElement("option");
        option.textContent = item.displaySummary;
        option.value = item.value;
        dropdown.appendChild(option);
        console.log(item);
    });

}

function createNewEvent(dropdown) {
    const newEventName = document.getElementById("input-eventName").value;

    const date = new Date();
    const value = crypto.randomUUID();
    const dateFormatter = new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const formattedDate = dateFormatter.format(date);

    const option = new Option(`${newEventName} (${formattedDate})`, value);
    dropdown.insertBefore(
       option,
       dropdown.firstChild
    );
    option.selected = true;
    document.querySelector('.email').classList.remove('expand');event.stopPropagation();

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
            console.error("Error fetching attendance:", error);
        });
}