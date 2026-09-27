---
doc_id: main-5fac11b42c
title: "﻿# Tonybot + WonderLLM + APP Remote (MicroPython)"
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型应用课程/01 大模型应用程序/main.py
source_type: official
status: processed
---

# ﻿# Tonybot + WonderLLM + APP Remote (MicroPython)

﻿# Tonybot + WonderLLM + APP Remote (MicroPython)

import _thread
import json
import machine
import time

import Hiwonder

import Hiwonder_IIC
from Hiwonder_BLE import BLE


def clamp(value, low, high):
    if value < low:
        return low
    if value > high:
        return high
    return value


class WonderLLMBridge:
    ADDR = 0x55

    def __init__(self, i2c_obj, i2c_mutex):
        self.i2c = i2c_obj
        self.i2c_mutex = i2c_mutex
        self.rx_parts = []
        self.expected_parts = 0



        self.tool_buzzer = {

            "tool_name": "set_buzzer",

            "command": "控制机器人的蜂鸣器时调用这个工具。count是蜂鸣器响的次数,freq是蜂鸣器频率,频率范围为100-5000",

            "params": [["count", "int"], ["freq", "int", 100, 5000]],
            "block": "true",
            "return": "false",
        }

        self.tool_led = {

            "tool_name": "set_led_color",

            "command": "设置左右RGB灯颜色。lr,lg,lb是左灯RGB, rr,rg,rb是右灯RGB, 范围0-255。",

            "params": [

                ["lr", "int", 0, 255],

                ["lg", "int", 0, 255],
                ["lb", "int", 0, 255],
                ["rr", "int", 0, 255],
                ["rg", "int", 0, 255],
                ["rb", "int", 0, 255],
            ],
            "block": "true",
            "return": "false",
        }
        self.tool_action_group = {
            "tool_name": "set_action_group",
            "command": "控制机器人执行动作组时调用这个工具。actionNum为动作组代号,0号立正(停下),1号前进,2号后退,3号左转,4号右转,7号俯卧撑,8号仰卧起坐,9号挥手,101号用于后倒时恢复,102号用于前倒时恢复,150号至158号都是舞蹈,executeNum为动作组运行次数",
            "params": [["actionNum", "int", 0, 200], ["executeNum", "int"]],
            "block": "true",
            "return": "false",
        }
        
        self.tool_mode = {
            "tool_name": "set_mode",
            "command": "切换机器人的模式时调用这个工
