---
doc_id: color-detection-0580dc9335
title: "include \"color_detection.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型应用课程/03 ESP32S3颜色识别程序/ColorDetection/color_detection.cpp
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
color_data_t color_data[4];



/* 颜色阈值 用户可在此处调整 */
vector<color_info_t> std_color_info = {
    { {0, 132, 19, 255, 0, 120}, 64, "red"},//use
    //{ {0, 255, 0, 255, 0, 121}, 64, "red"},//use
    {{57, 255, 141, 255, 146, 216}, 64, "green"},
    {{0, 39, 47, 255, 95, 255}, 64, "blue"},  //use
    {{125, 155, 70, 255, 90, 255}, 64, "purple"}
};

static uint8_t state_value;

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
        color_data[0].id = 1;
        color_data[0].center_x = (uint8_t)results[g_max_color_column_index].center[0];
        color_data[0].center_y = (uint8_t)results[g_max_color_column_index].center[1];
        /* right_down_x - left_up_x  */
        color_data[0].width = (uint8_t)(results[g_max_color_column_index].box[2] - results[g_max_color_column_index].box[0]);
        /* right_down_y - left_up_y  */
        color_data[0].length = (uint8_t)(results[g_max_color_co
