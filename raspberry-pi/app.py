from flask import Flask
import sqlite3

app = Flask(__name__)
DB = "data.db"


def get_latest_metric(metric_name, device_name):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT value
    FROM readings
    WHERE metric = ? AND device=?
    ORDER BY id DESC
    LIMIT 1
    """, (metric_name, device_name))

    row = cursor.fetchone()
    conn.close()

    value = row[0] if row is not None else None
    return value


@app.route("/api/latest")
def latest_data():
    return {
        "esp32_1": {
            "temperature": get_latest_metric("temperature", "esp32_1"),
            "humidity": get_latest_metric("humidity", "esp32_1"),
        },
        "pi": {
            "cpu_temp": get_latest_metric("cpu_temp", "pi"),
            "ram_usage": get_latest_metric("ram_usage", "pi"),
            "disk_usage": get_latest_metric("disk_usage", "pi")
        }
    }


@app.route("/")
def home():
    return """
        <html>
        <head> <title> EnvMonitor </title> </head>
        <body>
        <h2>ESP32_1</h2>

        <p>Temperature: <span id="temperature"> -- </span> °C</p>
        <p>Humidity: <span id="humidity"> -- </span> %</p>
        
        <h2>Raspberry Pi</h2>
        <p>CPU Temperature: <span id="cpu_temp"> -- </span> °C</p>
        <p>RAM Usage : <span id="ram_usage"> -- </span> %</p>
        <p>Disk Usage : <span id="disk_usage"> -- </span>%</p>

        <script>
        async function updateData() {
            const response = await fetch("/api/latest")
            const data = await response.json()

            document.getElementById("temperature").innerText = data.esp32_1.temperature
            document.getElementById("humidity").innerText = data.esp32_1.humidity

            document.getElementById("cpu_temp").innerText = data.pi.cpu_temp
            document.getElementById("ram_usage").innerText = data.pi.ram_usage
            document.getElementById("disk_usage").innerText = data.pi.disk_usage
        }

        updateData();
        setInterval(updateData, 5000);  
        </script>
        
        </body>
        </html>
    """


app.run(host="0.0.0.0", port=5000)
