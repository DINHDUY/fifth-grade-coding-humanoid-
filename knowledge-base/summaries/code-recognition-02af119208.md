---
doc_id: code-recognition-02af119208
title: "include \"code_recognition.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.5 二维码识别/02 二维码识别程序/01 WonderLLM二维码识别程序/code_recogniton/code_recognition.cpp
source_type: official
status: processed
---

# include "code_recognition.hpp"

#include "code_recognition.hpp"
#include "esp_log.h"
#include "esp_camera.h"
#include "esp_timer.h"
#include "arduino.h"
extern "C" {
#include "esp_code_scanner.h"
}

static const char *TAG = "code_recognition";

static QueueHandle_t xQueueFrameI = NULL;
static QueueHandle_t xQueueEvent = NULL;
static QueueHandle_t xQueueFrameO = NULL;
static QueueHandle_t xQueueResult = NULL;

static bool gReturnFB = true;
I2C_Data_t i2c_data; 

char result_data[MAX_STRING_LEN + 1] = "null";

static void task_process_handler(void *arg)
{
    camera_fb_t *frame = NULL;
    int64_t time1, time2;
    memcpy(i2c_data.data, "null", sizeof("null"));
    i2c_data.datalen = 5;

  while (true)
  {
    if (xQueueReceive(xQueueFrameI, &frame, portMAX_DELAY))
    {
        time1 = esp_timer_get_time();
        esp_image_scanner_t *esp_scn = esp_code_scanner_create();
        esp_code_scanner_config_t config = {ESP_CODE_SCANNER_MODE_FAST, ESP_CODE_SCANNER_IMAGE_RGB565, frame->width, frame->height};
        esp_code_scanner_set_config(esp_scn, config);
        int decoded_num = esp_code_scanner_scan_image(esp_scn, frame->buf);

        if(decoded_num){
            esp_code_scanner_symbol_t result = esp_code_scanner_result(esp_scn);
            time2 = esp_timer_get_time();
            // printf("Decode time in %lld ms.", (time2 - time1) / 1000);
            // printf("Decoded %s symbol \"%s\"\n", result.type_name, result.data);
            strncpy(i2c_data.data, result.data, sizeof(i2c_data.data));
            i2c_data.datalen = result.datalen;
            vTaskDelay(pdMS_TO_TICKS(20)); 
        }
        else {
            strncpy(i2c_data.data, "null", sizeof(i2c_data.data));
            i2c_data.datalen = 5;
        }

        esp_code_scanner_destroy(esp_scn);  
    }

    if (xQueueFrameO)
