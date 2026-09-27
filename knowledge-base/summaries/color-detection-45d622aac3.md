---
doc_id: color-detection-45d622aac3
title: "include \"color_detection.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Python/IOT例程/02 ESP32S3-Cam颜色识别例程及工具/ColorDetection/color_detection.cpp
source_type: official
status: processed
---

# include "color_detection.hpp"

#include "color_detection.hpp"
#include "esp_log.h"
#include "esp_camera.h"
#include "dl_image.hpp"
#include "fb_gfx.h"
#include "color_detector.hpp"
#include "who_ai_utils.hpp"

using namespace std;
using namespace dl;

static const char *TAG = "color_detection";

static QueueHandle_t xQueueFrameI = NULL;
static QueueHandle_t xQueueEvent = NULL;
static QueueHandle_t xQueueFrameO = NULL;
static QueueHandle_t xQueueResult = NULL;

static bool gReturnFB = true;
static int g_max_color_area = 0;
color_data_t color_data[5];



/* 颜色阈值 用户可在此处调整 */
vector<color_info_t> std_color_info = {
    {{151, 15, 70, 255, 90, 255}, 64, "red"},
    {{23, 34, 70, 255, 90, 255}, 64, "yellow"},
    {{45, 75, 70, 255, 90, 255}, 64, "green"},
    {{97, 117, 70, 255, 90, 255}, 64, "blue"},
    {{130, 155, 70, 255, 90, 255}, 64, "purple"}
};

/* 获取颜色检测的结果 */
static void get_color_detection_result(uint16_t *image_ptr, int image_height, int image_width, vector<color_detect_result_t> &results, uint16_t color)
{
  int g_max_color_column_index = 0;
  /* 寻找同色最大色块 */
  for (int i = 0; i < results.size(); ++i)
  {
    if (results[i].area > g_max_color_area)
    {
      g_max_color_area= results[i].area;
      g_max_color_column_index = i;
    }
    switch (color)
    {
      case COLOR_RED:

        color_data[0].center_x = (uint8_t)results[g_max_color_column_index].center[0];
        color_data[0].center_y = (uint8_t)results[g_max_color_column_index].center[1];
        /* right_down_x - left_up_x  */
        color_data[0].width = (uint8_t)(results[g_max_color_column_index].box[2] - results[g_max_color_column_index].box[0]);
        /* right_down_y - left_up_y  */
        color_data[0].length = (uint8_t)(results[g_max_color_column_index].box[3] - results[g_max_color_column_index].box[1]);
        break;
