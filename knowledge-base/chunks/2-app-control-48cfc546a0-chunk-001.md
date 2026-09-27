---
chunk_id: 2-app-control-48cfc546a0-chunk-001
doc_id: 2-app-control-48cfc546a0
title: "2. APP Control | Tonybot Documentation"
semantic_key: "2. APP Control | Tonybot Documentation"
keywords: ["app", "control", "tonybot", "documentation", "raw", "official-wiki", "app-control", "html"]
---

2. APP Control | Tonybot Documentation

Skip to content

SearchK

Main Navigation Home

Appearance

Menu
Return to top

Sidebar Navigation 

## 1. Getting Ready

1.1 Introduction to Tonybot

1.2 Packing List

1.3 Battery Charging Instructions and Usage Guidelines

## 2. APP Control

2.1 App Installation

2.2 App Connection

2.3 Feature Overview

2.4 App Control Program Download (Optional)

## 3. PC Software Action Control Course

3.1 PC Software Function Description

3.2 Action Invoking

3.3 Action Editing

3.4 Integrate Action Files

3.5 Offline Running

## 4. Large AI Model Basic Course

4.1 Large AI Model Module Introduction

4.2 Network Configuration and Device Binding

4.3 Button Description

4.4 Volume Control

4.5 Chat Mode

4.6 Clock Mode

4.7 Free Chat

4.8 Scene Understanding

4.9 Wake-up Word Modification

4.10 Firmware Download

## 5. Scratch Programming Projects

5.1 WonderCode User Guide

5.2 Secondary Development Course

5.3 Voice Interaction Course

5.4 AI Vision Course

5.5 IOT (Internet of Things) Course

5.6 Serial Communication Course

## 6. Python Programming Projects

6.1 Introduction to Hiwonder Python Editor

6.2 Secondary Development Course

6.3 Voice Interaction Course

6.4 AI Vision Course

6.5 IoT (Internet of Things) Course

6.6 Serial Communication Course

6.7 Large AI Model Application Course

6.8 Large AI Model Offline Course

## 7. Arduino Programming Projects

7.1 Programming Tool Installation and Overview

7.2 Secondary Development Course

7.3 Voice Interaction Course

7.4 AI Vision Course

7.5 IoT (Internet of Things) Course

7.6 Serial Communication Course

7.7 Large AI Model Application Course

7.8 Large AI Model Offline Course

## 8. Group Control

8.1 Project Introduction

8.2 Program Download

8.3 Operation Steps

Appendix

On this page

# 2. APP Control ​
Tonybot comes with the app control program already pre-installed, so you can start using it right away.

## 2.1 App Installation ​
For iOS users: Simply download Wonderbot from the App Store.

For Android users: Download "Wonderbot" from the Google Play Store using this link: https://play.google.com/store/apps/details?id=com.Wonder.bot

## 2.2 App Connection ​

NOTE

Before using the app, ensure that Bluetooth and location services are enabled in your phone's settings.

Pair the device using the Bluetooth button within the app. Do not attempt to pair it through your phone's settings with a passkey.

(1) Turn ON the robot.

(2) Open the Wonderbot app and tap-on and select Tonybot from the available robot models.

(3) Once you're in the game control interface, tap the flashing Bluetooth icon and select Tonybot from the list to complete the connection.

NOTE

If you can't find the device, tap the Search button to locate it.

(4) Once the connection is successful, the Bluetooth icon will stay lit, and the battery level will be shown on the left side.

## 2.3 Feature Overview ​
The app enables you to control Tonybot's movements, ultrasonic obstacle avoidance, ultrasonic following, action groups, and the "Reset" function, all with a simple tap of a button.

The interface is organized into two sections, as illustrated in the image below:

(1) Menu Bar
IconDescriptionReturn to the main interface to select the robot modelDisplays Tonybot's current battery level in real-timeCamera feed: View the live video stream from the ESP32 camera.Bluetooth connection: The icon flashes when disconnected and stays solid once connected.More information
(2) Control Zone
IconDescriptionControl Tonybot's movementView ultrasonic distance while in obstacle avoidance modeTurn the ultrasonic obstacle avoidance feature on or offEnable or disable the ultrasonic following featureSwitch the ultrasonic RGB lights on or offAdjust the color of the ultrasonic RGB lightsTap to trigger an action group on Tonybot.
(This includes both preset and custom action groups.)Control Tonybot's rotation in placeReset Tonybot's pose

## 2.4 App Control Program Download (Optional) ​
mian.py

Tonybot comes pre-installed with the app control program. If you download other custom programs, the app control functionality will be overwritten. To restore the app control feature, you can use one of the following methods:

### 2.4.1 Restore Program ​
The default factory program includes a self-recovery feature. To restore the app control, simply use the Python editor to connect to the device, delete the "main.py" program, and restart the device. Follow these steps:

(1) Open the Hiwonder Python Editor software.；

(2) Click the Connect button in the menu. Once the connection is established, the icon will turn green .

(3) In the "Device (Connected)" section, right-click the "main.py" file and select Delete. Afterward, restart the device to complete the process.

### 2.4.2 Redownload the App Control Program ​
(1) Open the Hiwonder Python Editor software .

(2) Click the Connect button in the menu. The icon will turn green once the connection is successfully established .

(3) Drag the "main.py" file into the Python editor.

(4) Click to download the program to the device. After the download is complete, restart the device to finalize the process.

Pager
Previous page1. Getting Ready

Next page3. PC Software Action Control Course

Chat
