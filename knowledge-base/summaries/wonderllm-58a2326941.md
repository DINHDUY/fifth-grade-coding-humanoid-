---
doc_id: wonderllm-58a2326941
title: "include \"WonderLLM.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/01 大模型应用程序/Tonybot_AI/WonderLLM.cpp
source_type: official
status: processed
---

# include "WonderLLM.h"

#include "WonderLLM.h"

#include "Wire.h"

#include "base_config.h"
#include "hiwonder_i2c.h"

#define MAX_JSON_SIZE 256

WonderLLM_Info WonderLLM_hiwonder;

namespace {

const char tool_finish[] =
    "{\"command\":\"mcp_setting\",\"params\":\"true\"}";

const char tool_buzzer[] =
    "{\"tool_name\":\"set_buzzer\",\"command\":\"控制机器人的蜂鸣器时调用这个工具。count是蜂鸣器响的次数,freq是蜂鸣器频率,频率范围为100-5000\","
    "\"params\":[[\"count\",\"int\"],[\"freq\",\"int\",100,5000]],"
    "\"block\":\"true\",\"return\":\"false\"}";

const char tool_led[] =
    "{\"tool_name\":\"set_led_color\",\"command\":\"设置左右RGB灯颜色。lr,lg,lb是左灯RGB, rr,rg,rb是右灯RGB, 范围0-255。\","
    "\"params\":[[\"lr\",\"int\",0,255],[\"lg\",\"int\",0,255],"
    "[\"lb\",\"int\",0,255],[\"rr\",\"int\",0,255],[\"rg\",\"int\",0,255],"
    "[\"rb\",\"int\",0,255]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_action_group[] =
    "{\"tool_name\":\"set_action_group\",\"command\":\"控制机器人执行动作组时调用这个工具。actionNum为动作组代号,0号立正(停下),1号前进,2号后退,3号左转,4号右转,7号俯卧撑,8号仰卧起坐,9号挥手,101号用于后倒时恢复,102号用于前倒时恢复,150号至158号都是舞蹈,executeNum为动作组运行次数\","
    "\"params\":[[\"actionNum\",\"int\",0,200],[\"executeNum\",\"int\"]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_mode[] =
    "{\"tool_name\":\"set_mode\",\"command\":\"切换机器人的模式时调用这个工具，可切换的模式包括避障、跟随:'avoid','follow','normal'\","
    "\"params\":[[\"running_mode\",\"string\"]],\"block\":\"true\","
    "\"return\":\"false\"}";

const char tool_status[] =
    "{\"tool_name\":\"self.robot.get_status\",\"command\":\"获取机器人的实时状态时调用这个工具。可查询'battery'(单位mV),'distance'(单位mm),'running_mode','Bodystate'(1前倒,0立正,2后倒)。\",\"params\":[[\"status_name\",\"string\"]],\"block\":\"true\",\"return\":\"true\"}";

static void delay_ms(int ms_num) {
  delay(ms_num);
}

static uint32_t Get_time_now() {
  return m
