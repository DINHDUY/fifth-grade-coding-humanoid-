---
doc_id: app-httpd-353494c84e
title: "// Copyright 2015-2016 Espressif Systems (Shanghai) PTE LTD"
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.2 图像回传/02 图像回传程序/image/app_httpd.cpp
source_type: official
status: processed
---

# // Copyright 2015-2016 Espressif Systems (Shanghai) PTE LTD

// Copyright 2015-2016 Espressif Systems (Shanghai) PTE LTD
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
#include "esp_http_server.h"
#include "esp_timer.h"
#include "esp_camera.h"
#include "img_converters.h"
#include "fb_gfx.h"
#include "esp32-hal-ledc.h"
#include "sdkconfig.h"
#include "camera_index.h"


#if defined(ARDUINO_ARCH_ESP32) && defined(CONFIG_ARDUHAL_ESP_LOG)
#include "esp32-hal-log.h"
#endif

// Face Detection will not work on boards without (or with disabled) PSRAM
#ifdef BOARD_HAS_PSRAM
#define CONFIG_ESP_FACE_DETECT_ENABLED 1
// Face Recognition takes upward from 15 seconds per frame on chips other than ESP32S3
// Makes no sense to have it enabled for them
#if CONFIG_IDF_TARGET_ESP32S3
#define CONFIG_ESP_FACE_RECOGNITION_ENABLED 1
#else
#define CONFIG_ESP_FACE_RECOGNITION_ENABLED 0
#endif
#else
#define CONFIG_ESP_FACE_DETECT_ENABLED 0
#define CONFIG_ESP_FACE_RECOGNITION_ENABLED 0
#endif

#if CONFIG_ESP_FACE_DETECT_ENABLED

#include <vector>
#include "human_face_detect_msr01.hpp"
#include "human_face_detect_mnp01.hpp"

#define TWO_STAGE 1 /*<! 1: detect by two-stage which is more accurate but slower(with keypoints). */
                    /*<! 0: detect by one-stage which is less accurate but faster(without keypoints). */

#if CONFIG_ESP_FACE_RECOGNIT
