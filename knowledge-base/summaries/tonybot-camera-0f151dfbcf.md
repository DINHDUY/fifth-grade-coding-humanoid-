---
doc_id: tonybot-camera-0f151dfbcf
title: "include \"tonybot_camera.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.5 二维码识别/02 二维码识别程序/02 Tonybot二维码识别程序/demo/tonybot_camera.cpp
source_type: official
status: processed
---

# include "tonybot_camera.h"

#include "tonybot_camera.h"
#include "base_config.h"


static bool wire_write_byte(uint8_t addr, uint8_t val) {
  Wire.beginTransmission(addr);
  Wire.write(val);
  if( Wire.endTransmission() != 0 ) {
    return false;
  }
  return true;
}

static bool wire_write_array(uint8_t addr, uint8_t reg, uint8_t *val, uint16_t len) {
  Wire.beginTransmission(addr);
  Wire.write(reg);
  for(uint16_t i = 0; i < len; i++) {
    Wire.write(val[i]);
  }
  if( Wire.endTransmission() != 0 ) {
    return false;
  }
  return true;
}

static int wire_read_array(uint8_t addr, uint8_t reg, uint8_t *val, uint8_t len) {
  uint8_t i = 0;  
  
  /* Indicate which register we want to read from */
  if (!wire_write_byte(addr, reg)) {
    return -1;
  }
  Wire.requestFrom(addr, len);
  while (Wire.available()) {
    if (i >= len) {
      return -1;
    }
    val[i] = Wire.read();
    i++;
  }
  return i;
}

uint16_t Tonybot_Camera::red_block_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, COLOR_DETECTION_FIRST_COLOR_REG, buf, buf_len);
}

uint16_t Tonybot_Camera::green_block_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, COLOR_DETECTION_SECOND_COLOR_REG, buf, buf_len);
}

uint16_t Tonybot_Camera::blue_block_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, COLOR_DETECTION_THIRD_COLOR_REG, buf, buf_len);
}

uint16_t Tonybot_Camera::purple_block_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, COLOR_DETECTION_FOURTH_COLOR_REG, buf, buf_len);
}

uint16_t Tonybot_Camera::color_id_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, COLOR_DETECTION_
