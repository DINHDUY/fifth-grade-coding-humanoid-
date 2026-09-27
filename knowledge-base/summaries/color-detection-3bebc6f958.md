---
doc_id: color-detection-3bebc6f958
title: "include \"color_detection.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.3 颜色识别/02 颜色识别程序/01 WonerLLM颜色识别程序/color_detection/color_detection.cpp
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
color_data_t color_data[4];

/* 颜色阈值 用户可在此处调整 */
vector<color_info_t> std_color_info = {
    {{0, 67, 144, 255, 94, 255}, 64, "red"},
    {{69, 88, 144, 197, 108, 255}, 64, "green"},
    {{87, 186, 138, 255, 126, 254}, 64, "blue"},
    {{125, 155, 70, 255, 90, 255}, 64, "purple"}
};

static uint8_t state_value;

/* 获取颜色检测的结果 */
static void get_color_detection_result(uint16_t *image_ptr, int image_height, int image_width, vector<color_detect_result_t> &results, uint16_t color)
{
  int g_max_color_area = 0;
  int g_max_color_column_index = 0;
  /* 寻找同色最大色块 */
  for (int i = 0; i < results.size(); ++i)
  {

    if (results[i].area > g_max_color_area)
    {
        dl::image::draw_hollow_rectangle(image_ptr, image_height, image_width,
                                            results[i].box[0],
                                            results[i].box[1],
                                            results[i].box[2],
                                            results[i].box[3],
                                            color);
        g_max_color_area= results[i].area;
        g_max_color_column_index = i;

    }
    
    switch (color)
    {
      case COLOR_RED:
        color_data[0].id = 1;
        color_data[0].center_x = (uint8_t)results[g_max_color_column_index].center[0];
        color_data[0].center_y = (
