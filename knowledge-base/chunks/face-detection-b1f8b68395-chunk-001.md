---
chunk_id: face-detection-b1f8b68395-chunk-001
doc_id: face-detection-b1f8b68395
title: "pragma once"
semantic_key: "pragma once"
keywords: ["pragma", "once", "raw", "github", "hiwonder-tonybot", "python", "wonderllm", "face_detection", "hpp"]
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
