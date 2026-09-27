---
doc_id: wonderllm-6682acd168
title: "include \"WonderLLM.h\""
source_path: raw/github/Hiwonder-Tonybot/Arduino/AI大模型应用课程/02 智慧交通行驶程序/line_follow/WonderLLM.cpp
source_type: official
status: processed
---

# include "WonderLLM.h"

#include "WonderLLM.h"
#include "hiwonder_i2c.h"
#include "Wire.h"
#include "base_config.h"

#define MAX_FRAME_SIZE 32 // I2C缓冲区大小

WonderLLM_Info WonderLLM_hiwonder;

const char tool_finish[] = 
		"{\"command\":\"mcp_setting\",\"params\":\"true\"}";	

const char tool_buzzer[] = 
		"{\"tool_name\":\"set_buzzer\",\"command\":\"控制机器人的蜂鸣器时调用这个工具。count是蜂鸣器响的次数,freq是蜂鸣器频率,频率范围为100-5000\","
		"\"params\":[[\"count\",\"int\"],[\"freq\",\"int\",100,5000]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_led[] = 
		"{\"tool_name\":\"set_led_color\","
		"\"command\":\"设置左右RGB灯颜色。lr,lg,lb是左灯RGB, rr,rg,rb是右灯RGB, 范围0-255。\","
		"\"params\":[[\"lr\",\"int\",0,255],[\"lg\",\"int\",0,255],[\"lb\",\"int\",0,255],"
		"[\"rr\",\"int\",0,255],[\"rg\",\"int\",0,255],[\"rb\",\"int\",0,255]],"
		"\"block\":\"true\",\"return\":\"false\"}";

// const char tool_ActionGroup[] = 
// 		"{\"tool_name\":\"set_action_group\",\"command\":\"控制机器人执行动作组时调用这个工具。actionNum为动作组代号,"
// 		"0号为立正,1号为前进,2号为后退,3号为单脚左转,4号为单脚右转,7号为俯卧撑,8号为仰卧起坐,9号为挥手,"
// 		"10号为鞠躬,11号为左侧滑,12号为右侧滑,15号为开怀大笑,16号为下蹲,17号为大鹏展翅,23号为原地左转,24号为原地右转,26号为抱娃娃,27号为伸右手,30号为下蹲立正,31号为下蹲前进,101号后倒起立,102号前倒站起,executeNum为动作组运行次数\","
// 		"\"params\":[[\"actionNum\",\"int\",0,200],[\"executeNum\",\"int\"]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_ActionGroup[] = 
		"{\"tool_name\":\"set_action_group\",\"command\":\"控制机器人执行动作组时调用这个工具。actionNum为动作组代号,"
		"0号为立正,1号为前进,2号为后退,3号为单脚左转,4号为单脚右转,7号为俯卧撑,8号为仰卧起坐,9号为挥手,executeNum为动作组运行次数\","
		// "10号为鞠躬,11号为左侧滑,12号为右侧滑,15号为开怀大笑,16号为下蹲,17号为大鹏展翅,23号为原地左转,24号为原地右转,26号为抱娃娃,27号为伸右手,30号为下蹲立正,31号为下蹲前进,101号后倒起立,102号前倒站起,executeNum为动作组运行次数\","
		"\"params\":[[\"actionNum\",\"int\",0,200],[\"executeNum\",\"int\"]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_status[] ="{\"tool_name
