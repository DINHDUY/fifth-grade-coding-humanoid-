---
doc_id: hiwonder-sensor-109d7145af
title: "include \"Hiwonder.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/01 大模型应用程序/Tonybot_AI/hiwonder_sensor.cpp
source_type: official
status: processed
---

#include "Hiwonder.hpp"
#include "hiwonder_i2c.h"

void Ultrasound_t::set_rgb(uint8_t mode, uint8_t *rgb1, uint8_t *rgb2) {
  uint8_t value;
  uint8_t rgb[6];

  switch(mode) {
    /* simple mdoe */
    case 0:
      value = RGB_WORK_SOLID_MODE;
      wire_write_array(ULTRASOUND_ADDR, RGB_WORK_MODE_REG, &value, 1);
      for(uint8_t i = 0; i < 6; i++) {
        rgb[i] = i < 3 ? rgb1[i] : rgb2[i - 3];
      }

      wire_write_array(ULTRASOUND_ADDR, SOLID_RGB_SET_REG, rgb, 6);
      break;

    /* breathing mdoe */
    case 1:
      value = RGB_WORK_BREATHING_MODE;
      wire_write_array(ULTRASOUND_ADDR, RGB_WORK_MODE_REG, &value, 1);
      for(uint8_t i = 0; i < 6; i++) {
        rgb[i] = i < 3 ? rgb1[i] : rgb2[i - 3];
      }
      wire_write_array(ULTRASOUND_ADDR, BREATHING_RGB_SET_REG, rgb, 6);
      break;

    default:
      break;
  }
}

uint16_t Ultrasound_t::_get_distance() {
  uint16_t distance;

  wire_read_array(ULTRASOUND_ADDR, DISTANCE_REG, (uint8_t *)&distance, 2);
  return distance;
}

uint16_t Ultrasound_t::get_distance() {
  uint32_t filter_sum = 0;

  filter[FILTER_NUM] = _get_distance();
  for(uint8_t i = 0; i < FILTER_NUM; i++) {
    filter[i] = filter[i + 1];
    filter_sum += filter[i];
  }
  return (uint16_t)(filter_sum / FILTER_NUM);
}
