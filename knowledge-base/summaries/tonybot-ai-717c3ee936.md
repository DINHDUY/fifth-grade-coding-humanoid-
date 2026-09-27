---
doc_id: tonybot-ai-717c3ee936
title: "include \"WonderLLM.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/01 大模型应用程序/Tonybot_AI/Tonybot_AI.ino
source_type: official
status: processed
---

# include "WonderLLM.h"

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

  if (millis() - last_battery_query_ms >= 10
