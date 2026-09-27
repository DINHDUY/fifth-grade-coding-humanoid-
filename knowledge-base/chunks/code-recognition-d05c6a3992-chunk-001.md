---
chunk_id: code-recognition-d05c6a3992-chunk-001
doc_id: code-recognition-d05c6a3992
title: "pragma once"
semantic_key: "pragma once"
keywords: ["pragma", "once", "raw", "github", "hiwonder-tonybot", "arduino", "wonderllm", "code_recogniton", "code_recognition", "hpp"]
---

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "global.h"


void register_code_recognition(const QueueHandle_t frame_i,
                                   const QueueHandle_t event,
                                   const QueueHandle_t result,
                                   const QueueHandle_t frame_o,
                                   const bool camera_fb_return);
