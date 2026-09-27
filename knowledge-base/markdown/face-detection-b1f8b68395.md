---
doc_id: face-detection-b1f8b68395
title: "pragma once"
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型离线课程/6.8.4 人脸识别/02 人脸识别程序/01 WonderLLM人脸识别程序/face_detection/face_detection.hpp
source_type: official
status: processed
---

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

typedef struct
{
  uint8_t center_x;
  uint8_t center_y;
  uint8_t width;
  uint8_t length;
} target_face_information_t;


void register_human_face_detection(const QueueHandle_t frame_i,
                                   const QueueHandle_t event,
                                   const QueueHandle_t result,
                                   const QueueHandle_t frame_o,
                                   const bool camera_fb_return);
