---
doc_id: low-posture-crossing-a8ccee4866
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/传感器开发课程/低空穿越/low_posture_crossing.py
source_type: official
status: processed
---

# import Hiwonder

import Hiwonder
import Hiwonder_IIC
import time
from time import ticks_ms, sleep_ms

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
buzzer = Hiwonder.Buzzer()

# 动作组定义
H_STAND = 0
L_STAND = 30
H_GO_FORWARD = 21
L_GO_FORWARD = 31

# 常量定义
MIN_DISTANCE = 150  # 150mm

# 初始化机器人
tony.runActionGroup(0, 1)
tony.attachHead()
time.sleep(1)
tony.detachHead()

# 全局变量
step = 0
last_tick = 0

def lowCrossing():
    """穿越障碍任务"""
    global step, last_tick
    
    if ticks_ms() <= last_tick:
        return
        
    Distance = sonar.getDistance() * 10
    
    if step == 0:
        if Distance > MIN_DISTANCE or Distance == 0:
            sonar.setRGB(0, 0, 50, 0)  # 绿色
            tony.runActionGroup(18, 1)
            sleep_ms(400)
            step = 1
            
    elif step == 1:
        if 0 < Distance < MIN_DISTANCE:
            tony.runActionGroup(18, 1)
            sleep_ms(2000)
            tony.runActionGroup(19, 1)
            sleep_ms(2000)
            sonar.setRGB(0, 50, 0, 0)  # 红色
            buzzer.playTone(1500, 100 , False)  # 蜂鸣器响
            tony.runActionGroup(L_STAND, 1)  # 运行下蹲
            sleep_ms(1300)
            step = 2
        else:
            tony.runActionGroup(H_GO_FORWARD, 1)  # 正常前进
            sleep_ms(1150)
            
    elif step == 2:
        if Distance > MIN_DISTANCE or Distance == 0:
            sleep_ms(500)
            sonar.setRGB(0, 0, 0, 50)  # 蓝色
            tony.runActionGroup(L_GO_FORWARD, 14)  # 以下蹲姿态前进
            sleep_ms(28500)
            step = 3
            
    elif step == 3:
        tony.runActionGroup(L_STAND, 1)  # 运行下蹲
        sleep_ms(2000)
        sleep_ms(200)
        tony.runActionGroup(H_STAND, 1)  # 正常立正
        sleep_ms(2000)
        sleep_ms(200)
        step = 0

# 主
