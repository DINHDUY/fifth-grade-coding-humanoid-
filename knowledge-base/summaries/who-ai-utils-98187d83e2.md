---
doc_id: who-ai-utils-98187d83e2
title: "include \"who_ai_utils.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI视觉项目课程/头部颜色追踪/ESP32S3Cam_ColorDetection/who_ai_utils.cpp
source_type: official
status: processed
---

# include "who_ai_utils.hpp"

#include "who_ai_utils.hpp"

#include "esp_log.h"
#include "esp_camera.h"

#include "dl_image.hpp"

static const char *TAG = "ai_utils";

// +-------+--------------------+----------+
// |       |       RGB565       |  RGB888  |
// +=======+====================+==========+
// |  Red  | 0b0000000011111000 | 0x0000FF |
// +-------+--------------------+----------+
// | Green | 0b1110000000000111 | 0x00FF00 |
// +-------+--------------------+----------+
// |  Blue | 0b0001111100000000 | 0xFF0000 |
// +-------+--------------------+----------+

void draw_detection_result(uint16_t *image_ptr, int image_height, int image_width, std::list<dl::detect::result_t> &results)
{
    int i = 0;
    for (std::list<dl::detect::result_t>::iterator prediction = results.begin(); prediction != results.end(); prediction++, i++)
    {
        dl::image::draw_hollow_rectangle(image_ptr, image_height, image_width,
                                         DL_MAX(prediction->box[0], 0),
                                         DL_MAX(prediction->box[1], 0),
                                         DL_MAX(prediction->box[2], 0),
                                         DL_MAX(prediction->box[3], 0),
                                         0b1110000000000111);

        if (prediction->keypoint.size() == 10)
        {
            dl::image::draw_point(image_ptr, image_height, image_width, DL_MAX(prediction->keypoint[0], 0), DL_MAX(prediction->keypoint[1], 0), 4, 0b0000000011111000); // left eye
            dl::image::draw_point(image_ptr, image_height, image_width, DL_MAX(prediction->keypoint[2], 0), DL_MAX(prediction->keypoint[3], 0), 4, 0b0000000011111000); // mouth left corner
            dl::image::draw_point(image_ptr, image_height, image_width, DL_MAX(prediction->keypoint[4], 0), DL_MAX(predicti
