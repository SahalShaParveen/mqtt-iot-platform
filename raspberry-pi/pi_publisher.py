import paho.mqtt.client as mqtt
import psutil
import json
import time

BROKER = "localhost"
TOPIC = "sensors/pi"

TEMPERATURE_PATH = "/sys/devices/virtual/thermal/thermal_zone0/temp"


def get_cpu_temp():
    with open(TEMPERATURE_PATH) as f:
        temperature = int(f.read()) / 1000
    return temperature


def on_connect(client, userdata, flags, rc):
    print("Connected with result code", rc)


client = mqtt.Client()
client.on_connect = on_connect

client.connect(BROKER, 1883, 60)
client.loop_start()

try:
    while True:
        payload = {
            "cpu_temp": get_cpu_temp(),
            "ram_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage("/").percent
        }

        print("publishing: ", payload)
        client.publish(TOPIC, json.dumps(payload))
        time.sleep(5)
except KeyboardInterrupt:
    print("stopping")
finally:
    client.disconnect()
