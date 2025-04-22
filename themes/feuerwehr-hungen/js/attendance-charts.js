import Chart from './bundle/bundledChart.js';

export function buildCharts(data) {
    const chartData = convertToChartData(data);
    fillSummaryCard(data);
    const chart =  buildChart(chartData);

    document.getElementById("submitAttendanceButton").addEventListener("click", function () {
        console.log("blalgbaslvbmlaqlegfal");

        removeData(chart);

        loadAttendanceStats().then(data => {
            addData(chart, Object.values(data));
        });
    });

}

function addData(chart, newData) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(newData);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}
function buildChart(chartData) {
    const ctx = document.getElementById('attendance-chart');
    return new Chart(ctx, {
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

    //console.log(labels);
    //console.log(data);
    //console.log(instructors);

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

/*
* Function to fill the summary card with the data
* The summary card contains the following data:
* - Amount of UE
* - Mean attendance
* - Amount of participants
 */
function fillSummaryCard(data) {

    let ueSum = 0.0;
    let eventRates = [];
    let meanRate = 0;
    let sumOfRates = 0;
    let totalUEOfAttendees = 0.0;
    let numberOfAttendees = 0;
    let points = new Map;
    let possibleAttendees = data[0].attendance.length;


    data.forEach(event => {
        const ue = parseFloat(event.ue);
        let attendeesThisEvent = 0;
        let possibleAttendees = event.attendance.length;
        event.attendance.forEach(participant => {
            const name = Object.keys(participant)[0];
            if (participant[name]) {
                attendeesThisEvent++;
                points.has(name) ? points.set(name, points.get(name) + ue) : points.set(name, ue);
            } else {
                points.has(name) ? points.set(name, points.get(name) + 0.0) : points.set(name, 0.0);
            }
        });
        ueSum += ue;

        const eventRate = (attendeesThisEvent / possibleAttendees);
        eventRates.push(eventRate);
    });

    points.forEach((accumulatedUE, name) => {
        if (accumulatedUE > 0) {
            totalUEOfAttendees += accumulatedUE;
            numberOfAttendees++;
        }
    });


    if (eventRates && eventRates.length > 0) {
        sumOfRates = eventRates.reduce((accumulator, currentRate) => accumulator + currentRate, 0);
    }
    meanRate = sumOfRates / eventRates.length;

    const participantsEl = document.getElementById('summary-participants');
    const meanEl = document.getElementById('summary-mean');
    const ueEl = document.getElementById('summary-ue');
    const meanUeEl = document.getElementById('summary-meanUE');
    participantsEl.innerHTML = 'Mitglieder: ' + possibleAttendees;
    ueEl.innerHTML = ueSum.toFixed(1);
    meanEl.innerHTML = (meanRate * 100).toFixed(1) + '%';
    meanUeEl.innerHTML = (totalUEOfAttendees / numberOfAttendees).toFixed(1);


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