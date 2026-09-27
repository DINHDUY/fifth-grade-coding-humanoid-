---
chunk_id: tonybot-camera-f69e1eca3b-chunk-001
doc_id: tonybot-camera-f69e1eca3b
title: "include \"tonybot_camera.h\""
semantic_key: "include \"tonybot_camera.h\""
keywords: ["include", "tonybot_camera", "raw", "github", "hiwonder-tonybot", "arduino", "tonybot", "demo", "cpp"]
---

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
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, COLOR_DETECTION_ID_REG, buf, buf_len);
}

uint16_t Tonybot_Camera::code_data_detection(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, CODE_DETECTION_REG, buf, buf_len);
}

uint16_t Tonybot_Camera::face_data_receive(uint8_t *buf, uint8_t buf_len) {
    return (uint16_t)wire_read_array(TONYBOT_CAMERA_ADDR, FACE_DETECTION_REG, buf, buf_len);
}

void Tonybot_Camera::begin(void)
{
    Wire.begin(IO_SDA,IO_SCL);
}
