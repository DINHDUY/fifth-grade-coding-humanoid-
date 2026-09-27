---
doc_id: 4-large-ai-model-basic-course-19409de078
title: "4. Large AI Model Basic Course | Tonybot Documentation"
source_path: raw/official-wiki/4-large-ai-model-basic-course.html
source_type: official
status: processed
---

4. Large AI Model Basic Course | Tonybot Documentation

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

# 4. Large AI Model Basic Course ​
[toc]

## 4.1 Large AI Model Module Introduction ​

### 4.1.1 Module Introduction ​
The large AI model module features a built-in high-performance ESP32-S3 main control chip. It integrates a 2MP HD camera, microphone, HD display screen, speaker, and CI1302 voice processing chip, deeply integrating text, voice, and vision models.

This module is easy to operate and is often paired with a robot to act as a super brain. It can understand commands at a deep level and provide excellent perception, reasoning, and action capabilities to create a flexible and natural human-robot interaction experience.

### 4.1.2 Operating Principle ​
The module is activated using the command wake-up mode. Speak the wake-up phrase to wake up the large AI model module. Human-robot interaction becomes available after activation. The default recognition language is English, and the English wake-up phrase is Hello Hiwonder.

Once the module recognizes the wake-up phrase, the buzzer sounds once, and interaction can begin. The module supports communication in English and automatically recognizes and switches languages based on the spoken language. If no voice is recognized within one minute, the module enters sleep mode, requiring reactivation for subsequent use.

Modifying the wake-up phrase and customizing command entries are supported. Refer to 4.9 Wake-up Word Modification to learn how to make modifications.

To flash the English firmware, refer to the firmware flashing guide in 4.10 Firmware Download.

### 4.1.3 Precautions ​

Use a 5V power supply. Otherwise, the module will be damaged.

Ensure the environment is quiet, as noisy surroundings will affect the recognition performance.

Speak clearly and at a moderate speed. Keep the distance to the module within 5 meters.

### 4.1.4 Hardware Interface Description ​ParameterDetailsParameterDetailsMain control chipESP32-S3Voice processing chipCI1302Camera2MPField of view123°Display screenLCD capacitive touch screenPower supply voltageType-C DC 5V or 4-pin I2C power supplyVoice recognition modeCommand wake-up modeCommunication methodI2C communicationVoice recognition rangeMaximum recognition range of 5 meters when quiet and maximum recognition range of 1 meter in noisy environmentsOnboard resourcesMicrophone, speaker, mode switch button, and wake-up buttonBluetoothBluetooth 5 and bluetooth mesh supportedSPI FlashMaximum 16MB supportedRAMInternal 512KB and external 16MB PSRAMWi-Fi802.11b/g/nProduct dimensions85 X 14 X 52 mmProduct weight30 G

### 4.1.5 Device Power-on ​
The module supports power supply through the following interfaces: ① Type-C interface at the bottom left, ② Type-C interface at the bottom right, and ③ 4-pin I2C communication port. Select any interface to connect to an external power supply device. The module will automatically power on once supplied.

Upon power-up, if it is the first use, the screen will display the Wi-Fi name and browser network configuration URL accompanied by voice broadcasting. Complete the network configuration according to 4.2 Network Configuration and Device Binding.

After completing the network configuration, device binding with the platform AI Agent is required. The screen will display the device ID and device binding platform URL accompanied by voice broadcasting of the verification code. Complete the device binding according to 4.2 Network Configuration and Device Binding.

After power-up, if the device binding is completed, a white circular progress bar will appear on the screen, indicating that the module is connecting to the network using the stored Wi-Fi details. If the connection fails, the screen will display the device hotspot name and device access URL accompanied by voice broadcasting. Reconfigure the connection details with a new Wi-Fi network available in the current environment according to 4.2 Network Configuration and Device Binding.

After power-up, if the device binding is completed and the configured Wi-Fi connection is available, the network connection will succeed after the progress bar loads. The screen will then switch to the conversation interface. Wake up the module to start human-robot interaction.

### 4.1.6 Device Restart ​
Manual restart is supported after powering up. Restart the module without disconnecting power by long pressing the Key button and Boot button simultaneously.

When the module detects the restart command from the long-press, it will automatically shut down and restart, and the screen will turn off. Release the buttons at this point. The module will automatically turn on afterward.

## 4.2 Network Configuration and Device Binding ​

### 4.2.1 Module Network Connection ​
Operating Steps

The module initiates network connection upon powering up. The module enters network configuration mode under the following conditions: ① The module is used for the first time, or the firmware is reflashed, and no available Wi-Fi connection details are saved in the memory, ② No hotspot in the current environment matches the saved Wi-Fi connection details, or ③ Manual entry is triggered by long pressing the Boot button on the right.

The screen will then display the device hotspot name and the device access URL, accompanied by voice broadcasting. The large AI model module will enable its own hotspot for connection and configuration. Hotspot names vary across devices with a unified format of Robot-xxxx. The hotspot Robot-1629 is used below as an example.

Search for and connect to the corresponding hotspot using a computer or smartphone. No password is required for this hotspot.

Open any browser and enter http://192.168.4.1 or click Network Configuration to access the page directly.

Click here to switch the display language of the interface.

Enter the name of the hotspot that the module should automatically connect to upon power-up in area ①, and enter the connection password in area ②. Finally, click Connect in area ③. The module will attempt to search for and connect to a matching hotspot in the current environment based on the provided details.

NOTE

Do not enter hotspot details for networks that cannot be detected in the current environment, have extremely weak signals, or do not support internet access.

If the module has previously saved connection details for other hotspots, the newly saved information will coexist with the existing records. Upon the next power-up, the module will read each saved record in order of preservation to match and connect to a hotspot.

A list of available hotspots detected in the current environment is shown on the interface. Clicking a hotspot will automatically populate the name in area ①, saving time and effort.

If the prompt shown below appears, it indicates that the hotspot cannot be found in the current environment or the connection password is incorrect. Re-enter the details.

If the prompt shown below appears, it indicates that the module has successfully detected and connected to the hotspot. The module will automatically restart and connect to the corresponding hotspot. The preparatory steps are now complete, and the various interactive modes of the large AI model module can be experienced according to the subsequent course documents.

NOTE

If the screen displays "Error: Failed to check for new version, retrying in xx seconds" after network configuration, the current hotspot might lack internet access or have poor network quality. Try switching to a different network.

Manually Entering Network Configuration Mode

The large AI model module supports manual entry into network configuration mode to allow custom hotspot selection.

After powering up, long-press the button on the right to send a restart command. The screen will turn off upon receiving the command. Continue to hold down the button. After the module restarts and begins attempting to connect, a white circular progress bar will appear. The module detects the button hold, stops matching external hotspots, and directly enters network configuration mode. Release the button at this point.

The existing hotspot configuration details will not be lost upon entering network configuration mode. Access the network configuration page or short-press the button on the right to exit network configuration mode.

After exiting network configuration mode, the module will continue to attempt connection based on the saved hotspot details. If the module fails to connect to any external hotspot, it will re-enter network configuration mode.

Managing Saved Connection Configurations Optional

In network configuration mode, after connecting to the module hotspot and entering the network configuration interface, the list of all saved hotspot connection configurations can be viewed, as shown below.

Click the delete icon corresponding to any saved hotspot connection to delete it, or click the up-arrow icon to increase its matching priority during network configuration, where the priority decreases from top to bottom in the list.

### 4.2.2 Device Binding ​
Upon powering up and completing network configuration, if it is the first use, the screen will display the 6-digit device ID and device binding platform URL accompanied by voice broadcasting. Complete the device binding with the platform AI Agent according to the instructions below.

Open any browser and access xiaozhi.me, or click Xiaozhi AI Chatbot to visit the page directly.

Click here to switch the display language of the interface.

Click Console to enter the Xiaozhi AI Agent management platform.

If logging in for the first time, register a platform account. The registration process is omitted here. After registering and logging in, enter the following interface and click Create Agent in the upper-left corner, then name the AI Agent. The configuration will be completed later by binding the device ID to this AI Agent.

Click Configure Role.

In the configuration interface, enter Hiwonder for the assistant nickname in area ①. Modifying this nickname is not recommended. If a modification is made, refer to 4.9 Wake-up Word Modification to update the module wake-up phrase accordingly. Select the conversation language and character voice in area ② based on the requirements. The character description in area ③ can use the default template or be customized. The following character description is recommended to ensure the AI Agent adapts to the subsequent interactive dialogue.

[Role Setting] 
{{assistant_name}} is a smart housekeeper with a physical body, capable of completing various tasks and following various instructions. 
[Core Features] 

- Understand the operator's intentions deeply 

- Give short answers without being wordy 

- Do not keep any memory 

- Give appropriate suggestions and execute them

Select No Memory for the memory type. DeepSeek V3 (Powerful) is recommended for the language model. More detailed operating parameters can be adjusted in the advanced settings, but keeping the default settings is recommended. Finally, click Save.

After saving successfully, return to the previous interface and click Add Device.

Enter the 6-digit device ID in the pop-up window and click Confirm to complete the device binding.

If the binding is successful, the prompt Device added successfully will appear on the page, as shown below. Select the Open Source version and click Start Using.

## 4.3 Button Description ​

NOTE

Before starting this section, ensure that the module has been powered on and the Wi-Fi and AI Agent configurations have been completed according to 4.1 Large AI Model Module Introduction and 4.2 Network Configuration and Device Binding.

### 4.3.1 Button Description ​
The module features two buttons, the Boot button and the Key button.

Module Button Controls
Boot Button - Mode Switching
Single press → Switch between Chat Mode and Clock Mode

Key Button - Status and Configuration
Single press → Switch between Chat Wake-up and Standby Status

long-press → Trigger Network Configuration Mode

Combined Operation - System Control
Press Boot and Key simultaneously → Execute Device Restart

## 4.4 Volume Control ​

NOTE

Before starting this section, ensure that the module has been powered on and the Wi-Fi and AI Agent configurations have been completed according to 4.1 Large AI Model Module Introduction and 4.2 Network Configuration and Device Binding.

During interaction with the large AI model module, the speaking volume of the module can be adjusted using voice commands to achieve an optimal interaction experience.

### 4.4.1 Voice Volume Control ​

During interaction with the large AI model module, volume adjustment commands can be issued to control the speaker volume.

To adjust the volume, enter the chat interface by speaking the wake-up phrase or short pressing the button on the right. Once the module is activated, refer to the following expressions: ① Adjust the volume to xx, where the valid range is 0 to 100 as integers only, or can be expressed as a percentage, or ② Increase the volume, which is a vague expression where the module adjusts the volume on its own.

NOTE

Changing the volume while the large AI model module is speaking will take effect in the next round of speech.

The spoken expressions do not need to strictly follow the examples provided above, as long as the same meaning is conveyed.

After recognition, the chat box returns the volume adjustment function to be called, which requires no attention. The chat box then displays the response from the large model and broadcasts it simultaneously. The response is randomly generated by the large model to ensure appropriate meaning.

## 4.5 Chat Mode ​

NOTE

Before starting this section, ensure that the module has been powered on and the Wi-Fi and AI Agent configurations have been completed according to 4.1 Large AI Model Module Introduction and 4.2 Network Configuration and Device Binding.

### 4.5.1 Mode Overview ​
In this mode, the module listens to and understands the spoken speech and provides appropriate responses.

### 4.5.2 Operating Instructions ​
After completing the network configuration, the module enters the chat interface first, as shown below.

Speak the designated wake-up phrase, which is Hello Hiwonder by factory default, or short-press either button to enter Chat Mode. A ding sound will be heard from the buzzer, the screen will switch to the chat box interface, and the chat module will be successfully activated to start listening to the speech.

NOTE

If the wake-up phrase is not spoken within 20 seconds on the expression interface, the module will enter Clock Mode, with the interface shown below. Clock Mode supports entering Chat Mode by speaking the wake-up phrase or short pressing the button on the right.

If entering Chat Mode by speaking the wake-up phrase, the module will send "Hello" by default as the conversation opener. The large model will then provide an appropriate response on the chat box interface and broadcast it simultaneously. The broadcast can be interrupted to skip quickly, as detailed in 4.7 Free Chat. The module will then start listening to the speech.

If entering Chat Mode by short pressing the button on the right, the module will immediately start listening to the speech.

## 4.6 Clock Mode ​

### 4.6.1 Mode Overview ​
In this mode, the module obtains and displays real-time weather and time information according to the configured city.

### 4.6.2 Operating Instructions ​
With no operation for 20 seconds, the interface switches to Clock Mode.

Once in Clock Mode, the module will remain in this mode if no other operations are performed.

In this mode, the module screen displays the following contents: ① Real-time weather information of the location and the weather forecast for the next two days, ② Current time and date, and ③ Current location city.

Modifying the city is supported. Activate the module by speaking the wake-up phrase or short pressing the button on the right to enter the chat interface. Issue commands to the large AI model module using the following expressions: ① Modify the city, where the city to switch to must be specified in the subsequent conversation, or ② Switch the location city to xx city. After the module replies, the location for Clock Mode will be updated simultaneously.

NOTE

The spoken expressions do not need to strictly follow the examples provided above, as long as the same meaning is conveyed.

## 4.7 Free Chat ​

NOTE

Before starting this section, ensure that the module has been powered on and the Wi-Fi and AI Agent configurations have been completed according to 4.1 Large AI Model Module Introduction and 4.2 Network Configuration and Device Binding.

### 4.7.1 General Operating Instructions ​

After the module is powered up and network configuration is complete, wake up the module by speaking the wake-up phrase or short pressing the button on the right to enter Chat Mode.

Speak freely. The module understands the speech and provides text and voice responses by connecting with the cloud large model. The module features memory, supporting multi-round continuous dialogue.

After each dialogue interaction ends, including after waking up the large AI model module, the module continues to listen. If no speech is recognized for one continuous minute, the module automatically stops listening. The large model then responds with an appropriate farewell phrase on the chat box interface and broadcasts it simultaneously. To continue the interaction, wake up the module again by speaking the designated wake-up phrase or short pressing the button on the right.

During the human-robot interaction dialogue, the conversation can also be actively ended. Issue commands to the large AI model module using the following expressions: ① Goodbye or ② Okay, stop here. The module will reply with an appropriate farewell phrase and stop listening.

NOTE

The spoken expressions do not need to strictly follow the examples provided above, as long as the same meaning is conveyed.

The large AI model module supports the voice interrupting function. While the module is speaking, which includes: ① The module responding to the speech, ② The module greeting the listener, or ③ The module bidding farewell, short-press the button on the right to immediately end the current speech and start listening to the next round of speech.

NOTE

Short pressing the button on the right when the module is not speaking will switch the interface to expression mode, requiring reactivation.

The large AI model module supports recognition and broadcasting in both Chinese and English. Switch the operating language of the module directly using the following expressions: ① Can Chinese be used for the dialogue? or ② Can English be used for communication?

NOTE

The spoken expressions do not need to strictly follow the examples provided above, as long as the same meaning is conveyed.

### 4.7.2 Special Function Calling ​

#### Overview ​

The module includes built-in special functions that can be called by speaking during the dialogue. Issue commands to the large AI model module to query all currently supported special functions using the following expressions: ① What can be done? or ② Introduce the functions. The table below lists the supported special functions:

NOTE

1. The spoken expressions do not need to strictly follow the examples provided above, as long as the same meaning is conveyed.

2. If custom MCP tools are registered to the module, this method can also be used to query the registered MCP tools to determine if the registration is successful.

No.FunctionNo.Function1Check weather4Tell jokes2Broadcast news5Check lunar calendar3Outfit suggestions6Play music

#### Invocation Examples ​

Issue commands to the large AI model module using the following expressions to call the corresponding special functions.

NOTE

The spoken expressions do not need to strictly follow the examples provided above, as long as the same meaning is conveyed.

Check Weather function: Check the weather in xx region.

Broadcast News function: ① Broadcast today's news or ② Introduce today's hot topics.

Outfit Suggestions function: What is suitable to wear for going out today?.

Tell Jokes function: ① Tell a joke or ② Tell a funny joke.

Play Music function: ① Play a song, where the singer and song title must be specified in the subsequent conversation, or ② Play xxx by singer xx.

NOTE

The music library comes from the built-in resource library of the large model. External importation is not supported, and songs not in the library cannot be played.

## 4.8 Scene Understanding ​

NOTE

Before starting this section, ensure that the module has been powered on and the Wi-Fi and AI Agent configurations have been completed according to 4.1 Large AI Model Module Introduction and 4.2 Network Configuration and Device Binding.

The large AI model module has a built-in HD camera, supporting real-time image capture and analysis using the vision large model to achieve deep interaction between the module and the external environment. Experience this feature in the following way.

### 4.8.1 Voice Interaction Control ​
After powering up, the module enters the chat interface. Speak the wake-up phrase or short-press the button on the right to activate the module.

Issue commands to the large AI model module using the following expressions: ① Describe what is in front or ② Take a picture

NOTE

The spoken expressions do not need to strictly follow the examples provided above, as long as the same meaning is conveyed.

After the command is understood, the camera captures a real-time image and displays it briefly on the screen for confirmation. The chat box returns the image capture function to be called, which requires no attention. The chat box then displays the analysis of the image from the large model and broadcasts it simultaneously. The response is randomly generated by the large model to ensure appropriate meaning.

NOTE

In the scene understanding function, continuous observation is not supported. The module only captures a single real-time image and analyzes it after a command is issued to enable the function.

## 4.9 Wake-up Word Modification ​

### 4.9.1 CI1302 Firmware Creation ​
The CI1302 chip performs the task of recognizing the wake-up phrase in the large AI model module. To wake up the module with a new nickname, create and flash a new CI1302 firmware. This section explains the firmware creation process in detail.

#### Wake-up Word Firmware Creation ​

NOTE

Creating firmware using the wake-up phrase HELLO-HIWONDER is used as an example, and the operating steps are identical for Chinese wake-up phrase creation. Note that the English wake-up phrase must be set in uppercase to take effect.

Open the ChipIntelli Voice AI Platform link to enter the official firmware creation website.

Click Platform on the menu bar, then click Product Firmware and SDK Deep Development under the product development section.

The system will prompt to log in to an account. If not registered, complete the platform account registration first. After successful login, click Offline Speech Recognition LM Application.

Click the Firmware & SDK Development entry in the submenu.

After the page redirects, click the icon shown below on the left.

Create a new product as shown below, where the product name and description can be customized, and choose Single Mic ASR for the application solution.

In the parameters pop-up, choose General -> Smart Hub for the product type, and choose CI1302 for the chip model. In the SDK name field, select CI13XX_SDK_ASR_Offline. In the SDK version field, select 1.12.16. The description can be filled in arbitrarily. After completing all options, click Create.

Next, fill in the basic project information. Since English recognition is needed, select English for the language type. Select the other information as shown in the figure below, and click Create once completed.

After entering the firmware configuration interface, the key parameters to modify will be explained. First, enable the Echo Cancellation function in the algorithm parameter settings.

In the hardware parameters, choose Internal RC for the crystal oscillator source, and turn off the baud rate calibration function.

In the print serial port configuration, set the UART0 level to open-drain, supporting an external pull-up of 5V.

Modify the communication serial port configuration by setting the baud rate to 115200 and setting the UART1 level to open-drain, supporting an external pull-up of 5V. Click Continue after configuration to proceed to the next step.

Proceed to the edit command words function and select the voice for broadcasting. Select Dane-English Male Voice here.

NOTE

The voice selected here is not the interaction voice used by the large AI model module. To adjust the interaction voice, go to the Xiaozhi AI platform console and adjust it in the AI Agent bound to the device ID, as detailed in 4.2 Network Configuration and Device Binding. Restart the device afterward to apply the changes.

The broadcasting function of the CI1302 is not used in subsequent applications, so any option can be selected arbitrarily.

Upload the command word attachment. Locate the Command Word Broadcast Word Protocol List V3 English Template (Hello Hiwonder) sheet at the path of 1. Tutorials \ 4. Large AI Model Basic Course \ 02 Appendix \ 06 Command and Broadcast Protocol List. Drag and drop it into the webpage to upload.

NOTE

To modify the wake-up phrase, open the Command Word Broadcast Word Protocol List V3 English Template (Hello Hiwonder) sheet and change HELLO-HIWONDER to the desired wake-up phrase. The English version of the wake-up phrase only supports English wake-up and must be in uppercase to take effect.

After uploading the file, the command word data will be displayed in the table below. Scroll to the bottom of the page and click Submit now.

NOTE

Only the wake-up phrase entry in the CI1302 entry list is used in practice, and other unused entries can be ignored.

After submission, wait a few minutes for the firmware creation to complete. Click Download file to obtain the created firmware.

A compressed package is obtained after the firmware download completes. Extract it to find a bin file. A dedicated firmware flashing tool will be used to flash it to the CI1302 chip afterward.

#### ​

### 4.9.2 CI1302 Firmware Flashing Method ​
This section explains how to flash firmware to the large AI model module.

#### Firmware Flashing ​

Connect the Type-C interface at the bottom of the large AI model module to the computer using a USB data cable.

Open the PACK_UPDATE_TOOL.exe file in the directory of the 02 CI1302 Chip Flashing Tool in the same path. Select the CI1302 chip and click Update.

NOTE

Flashing the firmware with the wake-up phrase Hello Hiwonder is used as an example.

Click Select firmware and locate the extracted bin firmware downloaded in the previous steps.

Locate the corresponding serial port and click to select it.

Press the left and right buttons of the large AI model module simultaneously to enter flashing mode, and wait for the process to complete successfully.

#### Wake-up Test ​

After flashing the firmware, restart the module. Wait for the module to complete network configuration and enter the expression interface. Speak the wake-up phrase of the new firmware. If the module buzzer sounds once, the interface switches to the chat interface, and a greeting is broadcast, the wake-up phrase modification is successful.

#### Extension ​

To ensure a consistent interaction workflow, the nickname of the AI Agent bound to the module can be updated simultaneously.

Access the Xiaozhi AI platform at xiaozhi.me, or click Xiaozhi AI Chatbot to visit directly. Enter the console, select the AI Agent bound to the module, select Configure Role, change the assistant nickname to the new wake-up phrase, click Save, and restart the device.

## 4.10 Firmware Download ​

### 4.10.1 Firmware Flashing ​

#### Overview ​

The ESP32-S3 main control chip of the large AI model module supports firmware flashing. The factory firmware or the Xiaozhi AI open-source firmware hiwonder_xiaozhi.bin provided in the course materials can be flashed for evaluation. Secondary development can also be performed using the Xiaozhi AI open-source code and uploaded to the module for verification and testing.

NOTE

After firmware flashing, the Wi-Fi connection details must be reconfigured. Refer to 4.2 Network Configuration and Device Binding for the operation method.

#### Device Connection ​

Connect the Type-C interface at the top of the large AI model module to the computer using a USB cable as shown below.

#### Operating Process ​

Open the file 02 Appendix \ 04 ESP32 Firmware Flashing Tool \ flash_download_tool_3.9.7.exe.

Select ESP32-S3 for the chip type, keep the other settings as default, and click OK.

After the tool opens, click the button ... to select the program bin file to be flashed. The factory firmware WonderMind.bin is used as an example below:

Check the box on the left, configure the remaining settings as shown below, and select the COM port occupied by the module.

NOTE

If the module fails to work properly after flashing with the SPI MODE set to DIO as shown in the configuration, try setting the SPI MODE to DOUT and flash again.

Click ERASE to clear the previously flashed firmware first, which is a mandatory step, and wait for the status bar to display FINISH.

Click START to download the selected firmware and wait for the progress bar to complete the loading to finish the firmware download.

Once the download is complete, reconnect the data cable. After powering up, the device will begin operating according to the new firmware.

Pager
Previous page3. PC Software Action Control Course

Next page5. Scratch Programming Projects

Chat
