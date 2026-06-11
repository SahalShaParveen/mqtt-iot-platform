from flask import Flask
import sqlite3

app = Flask(__name__)
DB = "data.db"


def get_latest_metric(metric_name, device_name):
    conn = sqlite3.connect(DB)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT timestamp, value
    FROM readings
    WHERE metric = ? AND device=?
    ORDER BY id DESC
    LIMIT 1
    """, (metric_name, device_name))

    row = cursor.fetchone()
    conn.close()

    return row


@app.route("/")
def home():
    temperature_info = get_latest_metric("temperature", "esp32_1")
    humidity_info = get_latest_metric("humidity", "esp32_1")

    temperature = temperature_info[1]
    humidity = humidity_info[1]

    return f"""
        <h2>ESP32_1</h2>

        <p>Temperature: {temperature} °C</p>
        <p>Humidity: {humidity} %</p>
    """


app.run(host="0.0.0.0", port=5000)
