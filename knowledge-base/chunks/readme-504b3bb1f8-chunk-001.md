---
chunk_id: readme-504b3bb1f8-chunk-001
doc_id: readme-504b3bb1f8
title: "Tonybot"
semantic_key: "Tonybot"
keywords: ["tonybot", "raw", "github", "hiwonder-tonybot", "readme"]
---

# Tonybot

English | [中文](README_cn.md)


## Product Overview

### About Tonybot

Tonybot is a humanoid biped robot powered by an ESP32 microcontroller, with a built-in ESP32-S3 AI vision module. It supports three complete programming environments — Scratch, MicroPython, and Arduino — making it an ideal platform for learners at every level, from visual block coding to advanced C++ firmware development.

Beyond standard robot motion, Tonybot is engineered as an integrated AI robotics learning platform. It combines voice interaction, computer vision, large language model (LLM) integration, and IoT connectivity into a single, open-source hardware ecosystem. Whether you want to command it with your voice, have it follow a colored object, or integrate it with a cloud AI service, the platform and tutorials are ready.


### The Core: A Multi-Layer Hardware Platform

Tonybot's hardware is designed to grow with you.

**Dual-MCU Architecture**: The motion controller runs on an ESP32, while a dedicated ESP32-S3 handles AI vision tasks. This separation keeps robot motion smooth while enabling real-time image processing.

**Triple Programming Environments**: Full support for Scratch (block-based), MicroPython, and Arduino IDE. Beginners can start visually with Scratch; intermediate users can write Python scripts; advanced developers can drop into Arduino's C++ for direct hardware control. All three environments ship with ready-to-use libraries and examples.

**Rich Sensor Suite**: Onboard IMU for fall detection and posture estimation, ultrasonic sonar for obstacle avoidance and distance following, temperature & humidity sensor, touch sensor, and a dot-matrix LED display — all pre-integrated and ready for experimentation.

**Action Group System**: Tonybot uses a numbered action group system (`runActionGroup(id, count)`), allowing complex motion sequences (walk forward, turn, bow, wave, somersault) to be triggered with a single call. Over 60 pre-programmed action groups are included.

### The Software Stack: From Basics to AI

Tonybot ships with a complete, layered software ecosystem.

**Hardware Abstraction Libraries**: Pre-built drivers for bus servos (`LobotServoController`), PWM servos, buzzer, IMU (Madgwick AHRS), ultrasonic module with RGB LEDs, temperature & humidity (AHTxx), dot-matrix display (WMMatrixLed), and IIC communication — so you write application logic, not driver code.

**Voice Interaction**: Integrated offline ASR (Automatic Speech Recognition) module. Recognized voice commands map directly to action groups or behaviors — say "walk forward," "wave hello," or "fall and stand up" to trigger the corresponding motion.

**AI Vision Module (ESP32-S3)**: The onboard camera module supports color detection, color tracking, face detection, face tracking, and visual line following. Vision results are sent to the main controller via IIC, triggering real-time robot responses.

**WonderLLM Integration**: Tonybot supports cloud-based large language model (LLM) control via the WonderLLM framework. The robot can receive natural language commands parsed from an LLM and execute structured actions — including running action groups, setting RGB LED colors, activating the buzzer, switching driving modes (obstacle avoidance / distance following), and reporting sensor status back to the cloud.

**IoT Connectivity**: Full MQTT-based IoT control is supported. Control Tonybot remotely from any connected device, receive real-time sensor data, and integrate into smart home or automation scenarios.


### What You Can Build

A structured learning path takes you from unboxing to frontier AI applications:

**Sensor Fundamentals** — Breathing LED, distance display, distance-controlled walking, find the treasure box, low-altitude walking, head-shake obstacle avoidance, fall & stand up recovery, smart fan, touch control, temperature & humidity detection.

**Serial Communication** — Bidirectional serial protocol between host and robot; build custom PC-to-robot control applications.

**Voice Interaction Projects** — Distance broadcast (text-to-speech), fall & wake-up recovery, human-robot conversation, voice command control.

**AI Vision Projects** — Image streaming, color recognition, color tracking, face recognition, visual line following.

**IoT Projects** — MQTT-based remote control, ESP32-S3 camera color recognition integration.

**AI Large Model Applications** — WonderLLM natural language control, intelligent traffic line-following driving, ESP32-S3 color detection integration, AI model firmware deployment.

**Mobile APP Control** — Real-time control via the Hiwonder smartphone app.


## Official Resources

### Official Hiwonder

- **Official Website**: [https://www.hiwonder.com/](https://www.hiwonder.com/)
- **Product Page**: [https://www.hiwonder.com/products/tonybot](https://www.hiwonder.com/products/tonybot)
- **Official Documentation**: [https://docs.hiwonder.com/projects/TonyBot/en/latest/](https://docs.hiwonder.com/projects/TonyBot/en/latest/)
- **Technical Support**: support@hiwonder.com


## Getting Started

### Hardware Requirements

- Tonybot humanoid robot (fully assembled)
- 7.4V LiPo battery pack
- USB-C cable (for programming)
- Smartphone with Hiwonder app (optional, for APP control)

### Software Setup

**For Scratch:**
1. Open the Hiwonder Scratch editor
2. Load any `.sb3` file from the `Scratch/` directory
3. Connect to Tonybot and run

**For Arduino:**
1. Install [Arduino IDE](https://www.arduino.cc/en/software)
2. Add ESP32 board support
3. Open any `.ino` sketch from the `Arduino/` directory
4. Select the correct COM port and upload

**For Python (MicroPython):**
1. Flash the included MicroPython firmware (`Scratch/firmware/Tonybot_*.bin`)
2. Open any `.py` file from the `Python/` directory
3. Upload and run via your preferred MicroPython tool

Refer to the [official documentation](https://docs.hiwonder.com/projects/TonyBot/en/latest/) for detailed setup instructions.


## Repository Structure

```
Tonybot/
├── Scratch/                        # Scratch block programming examples
│   ├── 传感器例程/                  # Sensor interaction demos
│   ├── 视觉交互/                    # AI vision demos
│   ├── 语音交互/                    # Voice control demos
│   ├── 串口通讯/                    # Serial protocol demo
│   ├── IoT/                        # IoT control demo
│   └── 固件/                       # MicroPython firmware binary
├── Python/                         # MicroPython programming examples
│   ├── 传感器开发课程/              # Sensor development examples
│   ├── 语音交互项目课程/            # Voice interaction examples
│   ├── AI视觉项目课程/              # AI vision examples
│   └── IOT例程/                    # IoT examples
├── Arduino/                        # Arduino programming examples
│   ├── 传感器开发课程/              # Sensor development examples
│   ├── 串口通信实操课程/            # Serial communication examples
│   ├── 语音交互项目课程/            # Voice interaction examples
│   ├── AI视觉项目课程/              # AI vision examples
│   ├── AI大模型应用课程/            # AI large model (online) examples
│   ├── AI大模型离线课程/            # AI large model (offline) examples
│   └── IOT例程/                    # IoT examples
└── Mobile_APP/                     # Smartphone APP control
```


## Community & Support

- **GitHub Issues**: Report bugs and request features
- **Email Support**: support@hiwonder.com
- **Documentation**: Comprehensive guides and tutorials at [docs.hiwonder.com](https://docs.hiwonder.com/projects/TonyBot/en/latest/)

## License

This project is open-source and available for educational and research purposes.

---

**Hiwonder** - Empowering Innovation in Robotics Education
