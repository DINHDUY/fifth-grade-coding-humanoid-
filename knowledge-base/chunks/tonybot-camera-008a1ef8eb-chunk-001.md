---
chunk_id: tonybot-camera-008a1ef8eb-chunk-001
doc_id: tonybot-camera-008a1ef8eb
title: "ifndef _TONYBOT_CAMERA_H_"
semantic_key: "ifndef _TONYBOT_CAMERA_H_"
keywords: ["ifndef", "tonybot_camera_h_", "raw", "github", "hiwonder-tonybot", "arduino", "tonybot", "demo", "tonybot_camera"]
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
#define CODE_DETECTION_REG                  0x00
#define CODE_DETECTION_STRING_LEN           21  //字符串长度信息+字符串数据

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
    uint16_t code_data_detection(uint8_t *buf, uint8_t buf_len);  
    uint16_t face_data_receive(uint8_t *buf, uint8_t buf_len);  
    
};

#endif
