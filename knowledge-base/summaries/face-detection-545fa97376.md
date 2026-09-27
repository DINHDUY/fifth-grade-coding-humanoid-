---
doc_id: face-detection-545fa97376
title: "include \"face_detection.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型离线课程/7.8.4 人脸识别/02 人脸识别程序/01 WonderLLM人脸识别程序/face_detection/face_detection.cpp
source_type: official
status: processed
---

# include "face_detection.hpp"

#include "face_detection.hpp"
#include "esp_log.h"
#include "esp_camera.h"
#include "dl_image.hpp"
#include "human_face_detect_msr01.hpp"
#include "human_face_detect_mnp01.hpp"
#include "who_ai_utils.hpp"


#define TWO_STAGE_ON 1

static const char *TAG = "human_face_detection";

static QueueHandle_t xQueueFrameI = NULL;
static QueueHandle_t xQueueEvent = NULL;
static QueueHandle_t xQueueFrameO = NULL;
static QueueHandle_t xQueueResult = NULL;

static bool gReturnFB = true;

static target_face_information_t detect_result;

static void save_detection_result(std::list<dl::detect::result_t> &results)
{
  int i = 0;
  for (std::list<dl::detect::result_t>::iterator prediction = results.begin(); prediction != results.end(); prediction++, i++)
  {
    if(prediction->keypoint.size() == 10)
    {
      detect_result.center_x = (uint8_t)(prediction->box[0] + ((prediction->box[2] - prediction->box[0]) / 2));
      detect_result.center_y = (uint8_t)(prediction->box[1] + ((prediction->box[3] - prediction->box[1]) / 2));
      detect_result.width = (uint8_t)(prediction->box[2] - prediction->box[0]);
      detect_result.length = (uint8_t)(prediction->box[3] - prediction->box[1]);
    }
  }
}

static void task_process_handler(void *arg)
{
  camera_fb_t *frame = NULL;
  HumanFaceDetectMSR01 detector(0.3F, 0.3F, 10, 0.3F);
#if TWO_STAGE_ON
  HumanFaceDetectMNP01 detector2(0.4F, 0.3F, 10);
#endif

  while (true)
  {
    if (xQueueReceive(xQueueFrameI, &frame, portMAX_DELAY))
    {
#if TWO_STAGE_ON
      std::list<dl::detect::result_t> &detect_candidates = detector.infer((uint16_t *)frame->buf, {(int)frame->height, (int)frame->width, 3});
      std::list<dl::detect::result_t> &detect_results = detector2.infer((uint16_t *)frame->buf, {(int)frame->height, (int)frame->width, 3}, detect_candid
