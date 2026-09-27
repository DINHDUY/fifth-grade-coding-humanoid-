---
chunk_id: lcd-display-bf13691858-chunk-001
doc_id: lcd-display-bf13691858
title: "pragma once"
semantic_key: "pragma once"
keywords: ["pragma", "once", "raw", "github", "hiwonder-tonybot", "arduino", "wonderllm", "face_detection", "lcd_display"]
---

#pragma once

#include "freertos/FreeRTOS.h"
#include "freertos/queue.h"
#include "freertos/task.h"
#include "freertos/semphr.h"

#ifdef __cplusplus
extern "C"
{
#endif

void register_lcd_display(const QueueHandle_t frame_i,
                            const QueueHandle_t event,
                            const QueueHandle_t result,
                            const QueueHandle_t frame_o,
                            const bool camera_fb_return);

#ifdef __cplusplus
}
#endif
