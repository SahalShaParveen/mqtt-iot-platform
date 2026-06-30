let CONFIG;

async function loadConfig() {
    CONFIG = await fetch("/api/config").then(r => r.json());
}


function buildDeviceList() {
    const select = document.getElementById("deviceSelect");
    select.innerHTML = "";

    for (const deviceName in CONFIG.devices) {
        const option = document.createElement("option");
        option.value = deviceName;
        option.innerText = deviceName;
        select.appendChild(option);
    }

    chartDevice = select.value;
    select.value = chartDevice;
}


function buildMetricList() {
    const select = document.getElementById("metricSelect");
    select.innerHTML = "";

    const metrics = CONFIG.devices[chartDevice].metrics;

    for (const metric of metrics) {
        const option = document.createElement("option");
        option.value = metric;
        option.innerText = metric;
        select.appendChild(option);
    }

    chartMetric = select.value;
    select.value = chartMetric;
}


function deviceChanged() {
    chartDevice = document.getElementById("deviceSelect").value;

    buildMetricList();

    chartMetric = document.getElementById("metricSelect").value;

    updateChart();
}


function metricChanged() {
    chartMetric = document.getElementById("metricSelect").value;

    updateChart();
}

function buildDashboard() {
    const dashboard = document.getElementById("dashboard");
    dashboard.innerHTML = "";

    for (const deviceName in CONFIG.devices) {
        const device = CONFIG.devices[deviceName];

        const title = document.createElement("h2");
        title.innerText = deviceName;
        dashboard.appendChild(title);

        for (const metric of device.metrics) {
            const row = document.createElement("p");

            const label = document.createElement("span");
            label.innerText = `${metric}: `;

            const value = document.createElement("span");
            value.id = `${deviceName}_${metric}`;
            value.innerText = "--";

            row.appendChild(label);
            row.appendChild(value);

            dashboard.appendChild(row);
        }
    }
}


function displayValue(id, value) {
    document.getElementById(id).innerText =
        value === null ? "N/A" : value;
}


async function updateData() {
    const response = await fetch("/api/latest");
    const data = await response.json();

    for (const deviceName in CONFIG.devices) {
        const deviceMetrics = CONFIG.devices[deviceName].metrics;

        for (const metric of deviceMetrics) {
            const value = data[deviceName][metric];

            const elementId = `${deviceName}_${metric}`;

            displayValue(elementId, value);
        }
    }
}


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


let chartDevice = "esp32_1"
let chartMetric = "temperature"


async function updateChart() {
    const res = await fetch(`/api/history?metric=${chartMetric}&device=${chartDevice}&period=${currentPeriod}`);
    const json = await res.json();

    chart.data.datasets[0].data = json.data;
    chart.data.datasets[0].label = chartMetric;
    chart.update();
}


function setPeriod(period) {
    currentPeriod = period;
    updateChart();
}


(async function start() {
    await loadConfig();
    buildDeviceList();
    buildMetricList();
    buildDashboard();
    initChart();
    updateData();
    updateChart();

    setInterval(updateData, CONFIG.dashboard.refresh_seconds * 1000);
    setInterval(() => updateChart(), CONFIG.dashboard.history_refresh_seconds * 1000);
})();