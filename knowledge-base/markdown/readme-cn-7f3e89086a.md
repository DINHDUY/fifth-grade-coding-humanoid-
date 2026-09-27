---
doc_id: readme-cn-7f3e89086a
title: "Tonybot"
source_path: raw/github/Hiwonder-Tonybot/README_cn.md
source_type: official
status: processed
---

# Tonybot

[English](README.md) | 中文


## 产品概述

### 关于Tonybot

Tonybot是一款以ESP32为主控的人形双足机器人，内置ESP32-S3 AI视觉模块。它完整支持Scratch图形化编程、MicroPython和Arduino三套开发环境，覆盖从零基础积木编程到进阶C++固件开发的全学习阶段，是一个面向各层次学习者的理想平台。

除了标准的机器人运动控制，Tonybot被设计为集成AI机器人学习平台，将语音交互、计算机视觉、大语言模型（LLM）控制和物联网连接融为一体，构成一套完整的开源硬件生态。无论你想用语音指挥机器人、让它追踪颜色目标，还是接入云端AI服务，平台和配套教程已经为你准备好了。


### 核心：多层次硬件平台

Tonybot的硬件设计随你一同成长。

**双MCU架构**：运动主控采用ESP32负责动作控制，独立的ESP32-S3专项处理AI视觉任务。双核分离设计确保机器人运动流畅的同时，实现实时图像处理。

**三套编程环境**：完整支持Scratch积木编程、MicroPython和Arduino IDE。初学者可从Scratch的可视化积木入手；进阶用户可以编写Python脚本；资深开发者可切换到Arduino C++进行底层硬件直控。三套环境均配备开箱即用的库文件和示例程序。

**丰富传感器套件**：板载IMU用于跌倒检测和姿态估计，超声波声呐实现障碍规避与距离跟随，温湿度传感器、触摸传感器以及LED点阵显示屏——全部预集成，即插即用。

**动作组系统**：Tonybot采用编号动作组机制（`runActionGroup(id, count)`），通过单次调用即可触发复杂运动序列（前进、转身、鞠躬、挥手、翻滚等）。内置60余个预编程动作组。

### 软件生态：从基础到AI

Tonybot随附完整的分层软件生态。

**硬件抽象库**：总线舵机（`LobotServoController`）、PWM舵机、蜂鸣器、IMU（Madgwick AHRS）、超声波+RGB彩灯模块、温湿度传感器（AHTxx）、LED点阵屏（WMMatrixLed）、IIC通信——全套预置驱动库，让你专注于应用逻辑开发。

**语音交互**：集成离线ASR（自动语音识别）模块。识别到的语音指令直接映射到对应动作组或行为——说"前进"、"招手"、"跌倒起立"，机器人立即执行对应动作。

**AI视觉模块（ESP32-S3）**：内置摄像头模块支持颜色识别、颜色追踪、人脸识别、人脸追踪和视觉巡线功能。视觉结果通过IIC发送至主控，实时驱动机器人做出响应。

**WonderLLM大模型接入**：Tonybot支持通过WonderLLM框架接入云端大语言模型（LLM）进行控制。机器人可接收LLM解析后的自然语言指令并执行结构化动作——包括运行动作组、设置RGB灯颜色、触发蜂鸣器、切换行驶模式（避障/跟随），以及向云端上报传感器状态。

**IoT物联网**：完整支持基于MQTT的物联网控制。从任意联网设备远程控制Tonybot，实时接收传感器数据，轻松接入智能家居或自动化应用场景。


### 你能做什么

结构化学习路径带你从开箱到前沿AI应用：

**传感器基础** — 呼吸灯、测距显示、定距行走、寻找宝盒、低空行走、摇头避障、跌倒起立、智能风扇、触摸控制、温湿度检测。

**串口通信** — 上位机与机器人双向串口协议；构建自定义PC端控制应用。

**语音交互项目** — 测距播报（语音播报距离）、跌倒唤起、人机互动对话、语音控制运动。

**AI视觉项目** — 图像回传、颜色识别、颜色追踪、人脸识别、视觉巡线。

**IoT物联网项目** — 基于MQTT的远程控制、ESP32-S3摄像头颜色识别集成。

**AI大模型应用** — WonderLLM自然语言控制、智慧交通巡线行驶、ESP32-S3颜色识别接入、AI大模型固件部署。

**手机APP遥控** — 通过幻尔智能APP实时控制。


## 官方资源

### 幻尔科技官方

- **官方网站**: [https://www.hiwonder.com/](https://www.hiwonder.com/)
- **产品页面**: [https://www.hiwonder.com/products/tonybot](https://www.hiwonder.com/products/tonybot)
- **官方文档**: [https://docs.hiwonder.com/projects/TonyBot/en/latest/](https://docs.hiwonder.com/projects/TonyBot/en/latest/)
- **技术支持**: support@hiwonder.com


## 快速开始

### 硬件准备

- Tonybot人形机器人（整机）
- 7.4V锂电池组
- USB-C数据线（用于烧录程序）
- 安装幻尔APP的智能手机（可选，用于APP遥控）

### 软件环境搭建

**Scratch编程：**
1. 打开幻尔Scratch编辑器
2. 从`Scratch/`目录加载任意`.sb3`文件
3. 连接Tonybot后运行

**Arduino编程：**
1. 安装 [Arduino IDE](https://www.arduino.cc/en/software)
2. 添加ESP32开发板支持
3. 打开`Arduino/`目录下任意`.ino`示例工程
4. 选择正确的COM端口并上传程序

**Python编程（MicroPython）：**
1. 烧录配套MicroPython固件（`Scratch/firmware/Tonybot_*.bin`）
2. 打开`Python/`目录下任意`.py`文件
3. 通过MicroPython工具上传并运行

详细搭建步骤请参考[官方文档](https://docs.hiwonder.com/projects/TonyBot/en/latest/)。


## 仓库结构

```
Tonybot/
├── Scratch/                        # Scratch积木编程示例
│   ├── 传感器例程/                  # 传感器交互演示
│   ├── 视觉交互/                    # AI视觉演示
│   ├── 语音交互/                    # 语音控制演示
│   ├── 串口通讯/                    # 串口通信演示
│   ├── IoT/                        # IoT控制演示
│   └── 固件/                       # MicroPython固件文件
├── Python/                         # MicroPython编程示例
│   ├── 传感器开发课程/              # 传感器开发课程示例
│   ├── 语音交互项目课程/            # 语音交互项目示例
│   ├── AI视觉项目课程/              # AI视觉项目示例
│   └── IOT例程/                    # IoT物联网示例
├── Arduino/                        # Arduino编程示例
│   ├── 传感器开发课程/              # 传感器开发课程示例
│   ├── 串口通信实操课程/            # 串口通信实操示例
│   ├── 语音交互项目课程/            # 语音交互项目示例
│   ├── AI视觉项目课程/              # AI视觉项目示例
│   ├── AI大模型应用课程/            # AI大模型（在线）应用示例
│   ├── AI大模型离线课程/            # AI大模型（离线）应用示例
│   └── IOT例程/                    # IoT物联网示例
└── Mobile_APP/                     # 手机APP遥控
```


## 社区与支持

- **GitHub Issues**: 提交问题反馈和功能建议
- **邮件支持**: support@hiwonder.com
- **文档资料**: 完整教程指南见 [docs.hiwonder.com](https://docs.hiwonder.com/projects/TonyBot/en/latest/)

## 许可证

本项目开源，可用于教育和研究目的。

---

**幻尔科技** - 赋能机器人教育创新
