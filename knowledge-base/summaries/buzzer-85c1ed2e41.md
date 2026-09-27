---
doc_id: buzzer-85c1ed2e41
title: "include \"../../Hiwonder.hpp\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/智能风扇/ultrasonic_fan/src/BUZZER/Buzzer.cpp
source_type: official
status: processed
---

# include "../../Hiwonder.hpp"

#include "../../Hiwonder.hpp"
#include <Arduino.h>

#define BUZZER_TASK_PERIOD  ((float)30) /* 蜂鸣器状态刷新间隔(ms) */

static void buzzer_control_callback(Buzzer_t* obj)
{
  /* 尝试从队列中取的新的控制数据， 如果成功取出则重置状态机重新开始一个控制循环 */
    if(obj->new_flag != 0) {
        obj->new_flag = 0;
        obj->stage = BUZZER_STAGE_START_NEW_CYCLE;
    }
    /* 状态机处理 */
    switch(obj->stage) {
        case BUZZER_STAGE_START_NEW_CYCLE: {
            if(obj->ticks_on > 0 && obj->freq > 0) {
                ledcWriteTone(obj->buzzer_channel , obj->freq); /* 鸣响蜂鸣器 */
                if(obj->ticks_off > 0) {/* 静音时间不为 0 即为 嘀嘀响 否则就是长鸣 */
                    obj->ticks_count = 0;
                    obj->stage = BUZZER_STAGE_WATTING_OFF; /* 等到鸣响时间结束 */
                }else{
					obj->stage = BUZZER_STAGE_IDLE; /* 长鸣，转入空闲 */
				}
            } else { /* 只要鸣响时间为 0 即为静音 */
                ledcWriteTone(obj->buzzer_channel , 0);
				obj->stage = BUZZER_STAGE_IDLE;  /* 长静音，转入空闲 */
            }
            break;
        }
        case BUZZER_STAGE_WATTING_OFF: {
            obj->ticks_count += BUZZER_TASK_PERIOD;
            if(obj->ticks_count >= obj->ticks_on) { /* 鸣响时间结束 */
                ledcWriteTone(obj->buzzer_channel , 0);
                obj->stage = BUZZER_STAGE_WATTING_PERIOD_END;
            }
            break;
        }
        case BUZZER_STAGE_WATTING_PERIOD_END: { /* 等待周期结束 */
            obj->ticks_count += BUZZER_TASK_PERIOD;
            if(obj->ticks_count >= (obj->ticks_off + obj->ticks_on)) {
                obj->ticks_count -= (obj->ticks_off + obj->ticks_on);
                if(obj->repeat == 1) { /* 剩余重复次数为1时就可以结束此次控制任务 */
                    ledcWriteTone(obj->buzzer_channel , 0);
                    obj->stage = BUZZER_STAGE_IDLE;
                } else {
                    ledcW
