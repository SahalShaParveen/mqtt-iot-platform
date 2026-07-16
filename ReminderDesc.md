# 🧠 IoT Room Monitoring & Control System (MQTT-Based)

## Overview

This project is a modular IoT system built around a Raspberry Pi acting as the central hub. It collects environmental sensor data, processes it, stores it in a local database, and exposes it through a web dashboard accessible from a phone or computer. The system is designed to be expandable, allowing additional sensors, actuators, and camera control features to be added over time.

The goal is to create a **real-time room monitoring and control system** with live data visualization and remote interaction capabilities.

---

## Core Architecture

The system is divided into four main layers:

### 1. Device Layer (Sensors & Actuators)

* ESP32 microcontroller reads temperature and humidity data (and potentially other sensors later).
* Raspberry Pi also collects its own internal CPU temperature.
* Optional actuators include servo motors for camera movement and a webcam for live video streaming.

These devices generate raw data and hardware actions.

---

### 2. Messaging Layer (MQTT Broker)

* Raspberry Pi runs an MQTT broker (e.g., Mosquitto).
* All devices publish sensor readings and system events to MQTT topics.
* Devices and services can also subscribe to topics to receive commands.

MQTT acts as the **communication backbone** between all components.

Example topics:

* `sensor/esp32/temperature`
* `sensor/esp32/humidity`
* `sensor/pi/cpu_temp`
* `camera/control`
* `servo/pan`

---

### 3. Processing & Storage Layer (Python Worker + SQLite)

* A Python script on the Pi subscribes to MQTT topics.
* Incoming sensor data is processed and stored in a local SQLite database.
* This database provides persistent time-series storage of all sensor readings and events.

Responsibilities:

* Listen to MQTT messages
* Parse sensor data
* Store structured records in SQLite
* Optionally trigger automation rules (e.g., alerts, camera activation)

---

### 4. Application Layer (Flask Web Server)

* A Flask (or FastAPI) web server runs on the Raspberry Pi.
* It exposes REST API endpoints that read data from SQLite.
* It serves a web dashboard accessible via browser on phone or laptop.

Features:

* Live sensor readings
* Historical graphs (via Pandas / Chart.js)
* System status (Pi temperature, uptime)
* Control buttons (camera on/off, servo movement)

Example endpoints:

* `/api/latest`
* `/api/history`
* `/dashboard`

---

## Camera System (Optional Expansion)

* A USB webcam is connected to the Raspberry Pi.
* Camera stream is NOT sent via MQTT.
* Instead, MQTT is used only for control signals:

  * `camera/start`
  * `camera/stop`
* The Pi hosts a separate HTTP-based video stream (MJPEG/RTSP/WebRTC).
* The web dashboard embeds or links to the live feed.

---

## Data Flow Summary

```
ESP32 sensors ─┐
Pi sensors ────┼──> MQTT Broker (Pi)
Camera control ─┘

MQTT Broker → Python Worker → SQLite Database

SQLite Database → Flask API → Web Dashboard → Phone

Phone → Flask → MQTT → (Camera / Servos / Actuators)
```

---

## Design Philosophy

* MQTT is used for **real-time communication between devices**
* SQLite is used for **long-term structured storage**
* Flask is used for **human interaction and visualization**
* The system is modular so components can be added or replaced independently

---

## Future Expansion Possibilities

* Add CO₂ or air quality sensors for room health scoring
* Add motion detection and automated camera activation
* Add servo-controlled pan/tilt camera system
* Add alert system (Telegram/phone notifications)
* Replace Flask dashboard with Grafana for advanced visualization
* Add multiple ESP32 nodes for multi-room monitoring

---

## Purpose

This project serves as:

* A practical IoT learning system
* A modular embedded systems architecture
* A portfolio-ready engineering project demonstrating:

  * MQTT communication
  * embedded systems integration
  * data storage and processing
  * web-based dashboard design
  * hardware-software interaction
_

