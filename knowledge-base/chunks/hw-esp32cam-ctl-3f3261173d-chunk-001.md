---
chunk_id: hw-esp32cam-ctl-3f3261173d-chunk-001
doc_id: hw-esp32cam-ctl-3f3261173d
title: "ifndef _HW_ESP32CAM_CTL_H_"
semantic_key: "ifndef _HW_ESP32CAM_CTL_H_"
keywords: ["ifndef", "hw_esp32cam_ctl_h_", "raw", "github", "hiwonder-tonybot", "arduino", "line_follow", "hw_esp32cam_ctl"]
---

#ifndef _HW_ESP32CAM_CTL_H_
#define _HW_ESP32CAM_CTL_H_

#define ESP32CAM_ADDR 0x52
#define COLOR_DETECTION_FIRST_COLOR_REG     0x00
#define COLOR_DETECTION_SECOND_COLOR_REG    0x01
#define COLOR_DETECTION_THIRD_COLOR_REG     0x02
#define COLOR_DETECTION_FOURTH_COLOR_REG    0x03
#define COLOR_DETECTION_ID_REG              0x04
#define FACE_DETECTION_REG                  0x01

#include <Arduino.h>
#include <Wire.h>

class HW_ESP32S3Cam {
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
