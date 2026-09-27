---
doc_id: tonybot-camera-16e22d7e3c
title: "ifndef _TONYBOT_CAMERA_H_"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/02 智慧交通行驶程序/line_follow/tonybot_camera.h
source_type: official
status: processed
---

#ifndef _TONYBOT_CAMERA_H_
#define _TONYBOT_CAMERA_H_

#define TONYBOT_CAMERA_ADDR                 0x51
#define COLOR_DETECTION_FIRST_COLOR_REG     0x00
#define COLOR_DETECTION_SECOND_COLOR_REG    0x01
#define COLOR_DETECTION_THIRD_COLOR_REG     0x02
#define COLOR_DETECTION_FOURTH_COLOR_REG    0x03
#define COLOR_DETECTION_ID_REG              0x04
#define FACE_DETECTION_REG                  0x01

#include <Arduino.h>
#include <Wire.h>

class Tonybot_Camera {
  public:
    void begin();
    uint16_t red_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t green_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t blue_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t purple_block_detection(uint8_t *buf, uint8_t buf_len);
    uint16_t color_id_detection(uint8_t *buf, uint8_t buf_len); 
    uint16_t face_data_receive(uint8_t *buf, uint8_t buf_len);  
};

#endif
