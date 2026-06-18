function displayValue(id, value) {
    document.getElementById(id).innerText =
        value === null ? "N/A" : value;
}

async function updateData() {
    const response = await fetch("/api/latest")
    const data = await response.json()

    displayValue("temperature", data.esp32_1.temperature);
    displayValue("humidity", data.esp32_1.humidity);

    displayValue("cpu_temp", data.pi.cpu_temp);
    displayValue("ram_usage", data.pi.ram_usage);
    displayValue("disk_usage", data.pi.disk_usage);
}

updateData();
setInterval(updateData, 5000);


let chart;
let currentPeriod = "24h";

function initChart() {
    const ctx = document.getElementById("tempChart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [{
                label: "Temperature",
                data: [],
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                x: { type: "time" }
            }
        }
    });
}


async function updateChart() {
    const res = await fetch(`/api/history?metric=temperature&device=esp32_1&period=${currentPeriod}`);
    const json = await res.json();

    chart.data.datasets[0].data = json.data;
    chart.update();
}


function setPeriod(period) {
    currentPeriod = period;
    updateChart();
}

initChart();
updateChart("24h");

setInterval(() => updateChart(), 10000);