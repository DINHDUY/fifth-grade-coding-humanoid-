---
chunk_id: tonybot-ai-717c3ee936-chunk-001
doc_id: tonybot-ai-717c3ee936
title: "include \"WonderLLM.h\""
semantic_key: "include \"WonderLLM.h\""
keywords: ["include", "wonderllm", "raw", "github", "hiwonder-tonybot", "arduino", "tonybot_ai", "ino"]
---

#include "WonderLLM.h"

#include "Hiwonder.hpp"
#include "LobotServoController.h"
#include "Servo.h"
#include "base_config.h"

namespace {

constexpr uint8_t MODE_NORMAL = 0;
constexpr uint8_t MODE_AVOID = 1;
constexpr uint8_t MODE_FOLLOW = 2;

constexpr uint8_t ACT_FIRST = 67;
constexpr uint8_t ACT_GO = 63;
constexpr uint8_t ACT_BACK = 96;
constexpr uint8_t ACT_TURN_LEFT = 65;
constexpr uint8_t ACT_TURN_RIGHT = 66;
constexpr uint8_t ACT_STAND_QUICKLY = 19;

constexpr uint16_t MIN_DISTANCE_TURN = 150;
constexpr int HEAD_BIAS = 0;

Buzzer_t buzzer;
Ultrasound_t ultrasound;
LobotServoController Controller(Serial2);
Servo sonarServo;
IMU imu;

char info[128];
uint8_t current_running_mode = MODE_NORMAL;
uint16_t battery_voltage_mv = 0;
uint32_t last_battery_query_ms = 0;

uint16_t gDistance = 0;
uint16_t gLDistance = 0;
uint16_t gRDistance = 0;
uint8_t obstacle_step = 0;
uint8_t follow_step = 0;
uint8_t active_running_mode = MODE_NORMAL;
bool have_move = false;
bool last_action_is_go_back = false;

uint8_t body_state = 0;
uint8_t front_fall_count = 0;
uint8_t back_fall_count = 0;
uint32_t last_imu_update_ms = 0;
float imu_roll_reference = 90.0f;
uint32_t imu_calibration_next_ms = 0;
float imu_calibration_roll_sum = 0.0f;
uint8_t imu_calibration_collected = 0;
bool imu_calibration_ready = false;

constexpr float BODY_FALL_DELTA_DEG = 30.0f;
constexpr uint8_t IMU_CALIBRATION_SAMPLES = 20;
constexpr uint32_t IMU_CALIBRATION_INTERVAL_MS = 50;
constexpr float IMU_REFERENCE_MIN_ROLL = 60.0f;
constexpr float IMU_REFERENCE_MAX_ROLL = 120.0f;

void updateBatteryVoltage() {
  Controller.receiveHandle();

  const uint16_t latest = Controller.getBatteryVolt();
  if (latest != static_cast<uint16_t>(-1)) {
    battery_voltage_mv = latest;
  }

  if (millis() - last_battery_query_ms >= 1000) {
    last_battery_query_ms = millis();
    Controller.sendCMDGetBatteryVolt();
  }
}

void moveHeadAngle(int angle) {
  if (!sonarServo.attached()) {
    sonarServo.attach(IO_Servo);
  }
  sonarServo.write(constrain(angle + HEAD_BIAS, 0, 180));
}

uint16_t sonarGetDistanceMm() {
  return ultrasound.get_distance();
}

void sonarSetRgbAll(uint8_t r, uint8_t g, uint8_t b) {
  uint8_t rgb_left[3] = {r, g, b};
  uint8_t rgb_right[3] = {r, g, b};
  ultrasound.set_rgb(RGB_WORK_SOLID_MODE, rgb_left, rgb_right);
}

void startImuPoseCalibration() {
  imu_calibration_roll_sum = 0.0f;
  imu_calibration_collected = 0;
  imu_calibration_next_ms = 0;
  imu_calibration_ready = false;
}

float readImuRoll() {
  float roll = 0.0f;
  float pitch = 0.0f;
  imu.get_angle(&roll, &pitch);
  return roll;
}

void serviceImuPoseCalibration() {
  if (imu_calibration_ready) {
    return;
  }

  if (imu_calibration_next_ms != 0 && static_cast<int32_t>(millis() - imu_calibration_next_ms) < 0) {
    return;
  }

  float roll = 0.0f;
  float pitch = 0.0f;
  imu.get_angle(&roll, &pitch);
  if (roll < IMU_REFERENCE_MIN_ROLL || roll > IMU_REFERENCE_MAX_ROLL) {
    imu_calibration_roll_sum = 0.0f;
    imu_calibration_collected = 0;
    imu_calibration_next_ms = millis() + IMU_CALIBRATION_INTERVAL_MS;
    return;
  }

  imu_calibration_roll_sum += roll;
  ++imu_calibration_collected;
  imu_calibration_next_ms = millis() + IMU_CALIBRATION_INTERVAL_MS;
  
  if (imu_calibration_collected < IMU_CALIBRATION_SAMPLES) {
    return;
  }

  const float average_roll = imu_calibration_roll_sum / IMU_CALIBRATION_SAMPLES;
  imu_roll_reference = average_roll;
  imu_calibration_ready = true;

  Serial.print("IMU roll avg: ");
  Serial.print(average_roll);
  Serial.print(" ref: ");
  Serial.println(imu_roll_reference);
}

float calibrateImuPoseReference() {
  startImuPoseCalibration();
  return imu_roll_reference;
}

void updateBodyState() {
  if (!imu_calibration_ready) {
    return;
  }

  if (millis() - last_imu_update_ms < 50) {
    return;
  }
  last_imu_update_ms = millis();

  const float roll = readImuRoll();
  const float roll_delta = roll - imu_roll_reference;

  if (roll_delta < -BODY_FALL_DELTA_DEG) {
    ++front_fall_count;
    back_fall_count = 0;
    if (front_fall_count > 10) {
      body_state = 1;
    }
  } else if (roll_delta > BODY_FALL_DELTA_DEG) {
    ++back_fall_count;
    front_fall_count = 0;
    if (back_fall_count > 10) {
      body_state = 2;
    }
  } else {  
    front_fall_count = 0;
    back_fall_count = 0;
    body_state = 0;
  }
}

void resetModeState() {
  obstacle_step = 0;
  follow_step = 0;
  have_move = false;
  last_action_is_go_back = false;
}

void setRunningMode(uint8_t mode) {
  if (mode > MODE_FOLLOW) {
    mode = MODE_NORMAL;
  }

  if (current_running_mode == mode) {
    return;
  }
  buzzer.on_off(0);

  current_running_mode = mode;
  have_move = false;

  if (mode != MODE_AVOID) {
    obstacle_step = 0;
    last_action_is_go_back = false;
  }
  if (mode != MODE_FOLLOW) {
    follow_step = 0;
  }
}

void exitRunningMode(uint8_t mode) {
  if (mode == MODE_AVOID) {
    Controller.stopActionGroup();
    Controller.waitForStop(1000);
    Controller.runActionGroup(0, 1);
    moveHeadAngle(90);
    Controller.waitForStop(2000);
  } else if (mode == MODE_FOLLOW) {
    sonarSetRgbAll(0, 240, 0);
    Controller.stopActionGroup();
    Controller.waitForStop(1000);
    Controller.runActionGroup(0, 1);
    Controller.waitForStop(2000);
  }
}

void enterRunningMode(uint8_t mode) {
  if (mode == MODE_AVOID) {
    moveHeadAngle(90);
    obstacle_step = 0;
    Controller.runActionGroup(0, 1);
    Controller.waitForStop(2000);
  } else if (mode == MODE_FOLLOW) {
    sonarSetRgbAll(0, 0, 240);
    follow_step = 0;
    Controller.runActionGroup(0, 1);
    Controller.waitForStop(2000);
  }
}

void getAllDistance() {
  sonarSetRgbAll(0, 50, 50);

  moveHeadAngle(90);
  delay(200);
  gDistance = sonarGetDistanceMm();

  moveHeadAngle(145);
  delay(500);
  uint16_t temp_distance = sonarGetDistanceMm();

  moveHeadAngle(180);
  delay(500);
  gLDistance = sonarGetDistanceMm();
  if (temp_distance < gLDistance) {
    gLDistance = temp_distance;
  }

  moveHeadAngle(45);
  delay(700);
  temp_distance = sonarGetDistanceMm();

  moveHeadAngle(0);
  delay(500);
  gRDistance = sonarGetDistanceMm();
  if (temp_distance < gRDistance) {
    gRDistance = temp_distance;
  }

  moveHeadAngle(90);
  delay(400);
}

void obstacleAvoidance() {
  const uint16_t distance = sonarGetDistanceMm();

  if (obstacle_step == 0) {
    gDistance = distance;
    if (gDistance >= MIN_DISTANCE_TURN || gDistance == 0) {
      if (!Controller.isRunning()) {
        sonarSetRgbAll(0, 50, 0);
        Controller.runActionGroup(ACT_FIRST, 1);
        Controller.waitForStop(2000);
        Controller.runActionGroup(ACT_GO, 0);
        delay(1300);
        have_move = true;
        obstacle_step = 1;
      }
    } else {
      obstacle_step = 2;
    }
  } else if (obstacle_step == 1) {
    gDistance = distance;
    if (gDistance < MIN_DISTANCE_TURN && gDistance > 0) {
      Controller.stopActionGroup();
      Controller.waitForStop(1000);
      Controller.runActionGroup(ACT_FIRST, 1);
      Controller.waitForStop(2000);
      Controller.runActionGroup(ACT_STAND_QUICKLY, 1);
      delay(500);
      obstacle_step = 2;
    }
  } else if (obstacle_step == 2) {
    if (!Controller.isRunning()) {
      getAllDistance();
      obstacle_step = 3;
    }
  } else if (obstacle_step == 3) {
    sonarSetRgbAll(0, 0, 50);
    if ((gDistance > MIN_DISTANCE_TURN || gDistance == 0) && !last_action_is_go_back) {
      obstacle_step = 0;
      last_action_is_go_back = false;
      return;
    }

    if ((((gLDistance > gRDistance) && gLDistance > MIN_DISTANCE_TURN) || gLDistance == 0) && gDistance > 50) {
      if (have_move) {
        Controller.runActionGroup(36, 1);
        Controller.waitForStop(600);
      }
      Controller.runActionGroup(ACT_TURN_LEFT, 4);
      Controller.waitForStop(2200);
      last_action_is_go_back = false;
      obstacle_step = 2;
    } else if ((((gRDistance > gLDistance) && gRDistance > MIN_DISTANCE_TURN) || gRDistance == 0) && gDistance > 50) {
      if (have_move) {
        Controller.runActionGroup(37, 1);
        Controller.waitForStop(600);
      }
      Controller.runActionGroup(ACT_TURN_RIGHT, 4);
      Controller.waitForStop(2200);
      last_action_is_go_back = false;
      obstacle_step = 2;
    } else {
      Controller.runActionGroup(ACT_BACK, 4);
      Controller.waitForStop(3300);
      Controller.runActionGroup(ACT_FIRST, 1);
      Controller.waitForStop(400);
      Controller.runActionGroup(ACT_STAND_QUICKLY, 1);
      Controller.waitForStop(600);
      last_action_is_go_back = true;
      obstacle_step = 2;
    }

    have_move = false;
  }
}

void distanceWalking() {
  const uint16_t distance = sonarGetDistanceMm();

  if (follow_step == 0) {
    if (distance > 30 && distance < 180) {
      sonarSetRgbAll(50, 0, 0);
      have_move = true;
      follow_step = 1;
    } else if (distance > 300 && distance < 400) {
      sonarSetRgbAll(0, 50, 0);
      Controller.runActionGroup(ACT_FIRST, 1);
      Controller.waitForStop(1000);
      have_move = true;
      follow_step = 2;
    } else if (have_move) {
      follow_step = 3;
    } else {
      sonarSetRgbAll(0, 0, 50);
    }
  } else if (follow_step == 1) {
    if ((distance > 30 && distance < 180) || have_move) {
      have_move = false;
      Controller.runActionGroup(ACT_BACK, 1);
      Controller.waitForStop(2000);
    } else {
      follow_step = 3;
    }
  } else if (follow_step == 2) {
    if ((distance > 300 && distance < 400) || have_move) {
      have_move = false;
      Controller.runActionGroup(ACT_GO, 1);
      Controller.waitForStop(2000);
    } else {
      follow_step = 3;
    }
  } else if (follow_step == 3) {
    Controller.runActionGroup(ACT_STAND_QUICKLY, 1);
    sonarSetRgbAll(0, 0, 50);
    Controller.waitForStop(1000);
    have_move = false;
    follow_step = 0;
  }
}

void processRunningMode() {
  if (active_running_mode != current_running_mode) {
    exitRunningMode(active_running_mode);
    active_running_mode = current_running_mode;
    enterRunningMode(active_running_mode);
  }

  if (current_running_mode == MODE_AVOID) {
    obstacleAvoidance();
    delay(50);
  } else if (current_running_mode == MODE_FOLLOW) {
    distanceWalking();
    delay(50);
  }
  
}

void sendStatusBattery() {
  char params[48];
  snprintf(params, sizeof(params), "[[\"battery\",\"%u\"]]", battery_voltage_mv);
  WonderLLM_Send_Status(params);
}

void sendStatusDistance() {
  char params[48];
  snprintf(params, sizeof(params), "[[\"distance\",\"%u\"]]", sonarGetDistanceMm());
  WonderLLM_Send_Status(params);
}

void sendStatusRunningMode() {
  const char* mode_name = "normal";
  if (current_running_mode == MODE_AVOID) {
    mode_name = "avoid";
  } else if (current_running_mode == MODE_FOLLOW) {
    mode_name = "follow";
  }

  char params[56];
  snprintf(params, sizeof(params), "[[\"running_mode\",\"%s\"]]", mode_name);
  WonderLLM_Send_Status(params);
}

void sendStatusBodyState() {
  char params[40];
  snprintf(params, sizeof(params), "[[\"Bodystate\",\"%u\"]]", body_state);
  WonderLLM_Send_Status(params);
}

}  // namespace

void setup() {
  delay(200);

  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, IO_BaseRX, IO_BaseTX);

  sonarServo.attach(IO_Servo);
  sonarServo.write(90);
  delay(200);
  sonarServo.detach();
  buzzer.init(IO_BUZZER);
  Controller.runActionGroup(0, 1);
  delay(1000);

  WonderLLM_Init();
  imu.begin();
  delay(2000);
  startImuPoseCalibration();

  Controller.setActionGroupSpeed(ACT_TURN_LEFT, 150);
  Controller.setActionGroupSpeed(ACT_TURN_RIGHT, 150);
  Controller.sendCMDGetBatteryVolt();
  sonarSetRgbAll(0, 240, 0);
}

void loop() {
  updateBatteryVoltage();
  imu.update();
  serviceImuPoseCalibration();
  updateBodyState();
  WonderLLM_Info_Get(&WonderLLM_hiwonder);

  if (WonderLLM_hiwonder.Frame_mode != Frame_NULL) {
    snprintf(info, sizeof(info), "raw str:%s\r\n", WonderLLM_hiwonder.json_data_raw);
    Serial.print(info);
    memset(WonderLLM_hiwonder.json_data_raw, 0, sizeof(WonderLLM_hiwonder.json_data_raw));

    switch (WonderLLM_hiwonder.Frame_mode) {
      case Frame_set_led_color:
        ultrasound.set_rgb(RGB_WORK_SOLID_MODE, WonderLLM_hiwonder.rgb_left, WonderLLM_hiwonder.rgb_right);
        WonderLLM_Send_Action_Finish();
        break;

      case Frame_set_buzzer:
        buzzer.blink(WonderLLM_hiwonder.buzzer_frequency, 200, 200, WonderLLM_hiwonder.buzzer_count);
        WonderLLM_Send_Action_Finish();
        break;

      case Frame_ActionGroup:
        WonderLLM_Send_Action_Finish();
        Controller.runActionGroup(WonderLLM_hiwonder.ActionNum, WonderLLM_hiwonder.ExecuteActionNum);
        break;

      case Frame_set_running_mode:
        setRunningMode(static_cast<uint8_t>(WonderLLM_hiwonder.running_mode));
        WonderLLM_Send_Action_Finish();
        break;

      case Frame_get_status_battery:
        sendStatusBattery();
        break;

      case Frame_get_status_distance:
        sendStatusDistance();
        break;

      case Frame_get_status_running_mode:
        sendStatusRunningMode();
        break;

      case Frame_get_status_Bodystate:
        sendStatusBodyState();
        break;

      default:
        break;
    }
  }
  
  processRunningMode();
  delay(20);
}
