import Chart from './modules/chart.js/auto/auto.js';

let allEventsData;

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('attendance-chart');


    let chartData;
    // Load attendance stats
    loadAttendanceStats().then(data => {
        if (!data) return;
        chartData = convertToChartData(Object.values(data));

        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                barPercentage: 0.8,
                skipNull: true,
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
                elements: {
                    point: {
                        pointStyle: 'line',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        ticks: {
                            autoSkip: false,
                            maxRotation: 90,
                            minRotation: 90
                        }
                    }
                },
                layout: {
                    padding: {
                        right: 10,
                        left: 5
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Feuerwehr Hungen - Ausbildungsbeteiligung'
                    },
                    tooltip: {
                        callbacks: {
                            footer: footer,
                        }
                    }
                }
            }
        });
    });

});

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

/* Function to convert json data to chart.js format
* The labels are the names of the participants
* The dataset is the amount of events the participant attended
* The attendance is an array of objects, where each object is
* a participant with a boolean value for attendance
 */
function convertToChartData(jsonData) {
    const labels = [];
    const data = [];
    const instructors= [];


    jsonData.forEach(event => {
        // Get the ue of the event
        const ue = event.ue;
        const eventInstructor = event.instructor;
        event.attendance.forEach(participant => {
            const name = Object.keys(participant)[0];
            if (!labels.includes(name)) {
                labels.push(name);
                data.push(0.0);
                instructors.push(0.0);
            }
            if (participant[name]) {
                data[labels.indexOf(name)] =  parseFloat(data[labels.indexOf(name)]) + parseFloat(ue);
            }
        });
        // Get the instructor for the event
        if (eventInstructor){
            eventInstructor.forEach(instructor => {
                instructors[labels.indexOf(instructor)] = parseFloat(instructors[labels.indexOf(instructor)]) + parseFloat(ue);
            })
        }
    });

    console.log(labels);
    console.log(data);
    console.log(instructors);

    // Build qouta data which is an array of 40.0 values with as much entry as there are participants
    const qouta = Array(labels.length).fill(40.0);

    return {
        labels: labels,
        datasets: [{
            label: 'Teilnehmer',
            data: data,
            backgroundColor: '#063480',
            borderColor: '#063480',
            borderWidth: 1
        },
            {
                label: 'Ausbilder',
                data: instructors,
                backgroundColor: '#E6B01D',
                borderColor: '#E6B01D',
                borderWidth: 1
            },
            {
                label: 'Vorgabe',
                type: 'line',
                data: qouta,
                borderColor: '#6fac46',
            }
        ]
    };
}

const footer = (tooltipItems) => {
    let sum = 0.0;

    tooltipItems.forEach(function(tooltipItem) {
        if (tooltipItem.dataset.type !== 'line') {
            sum += tooltipItem.parsed.y;
        }
    });
    return 'Sum: ' + sum;
};