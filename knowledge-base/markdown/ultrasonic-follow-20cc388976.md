---
doc_id: ultrasonic-follow-20cc388976
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/传感器开发课程/定距行走/ultrasonic_follow.py
source_type: official
status: processed
---

import Hiwonder
import Hiwonder_IIC
import time

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar  = Hiwonder_IIC.I2CSonar(iic)

tony.runActionGroup(0 , 1)
tony.attachHead()
time.sleep(1)
tony.detachHead()

last_tick = 0
from time import ticks_ms, sleep_ms

# 全局变量
Distance = 0
have_move = False
step = 0
last_tick = 0

def Distancewalking():
    """定距行走任务"""
    global step, last_tick, have_move
    
    if ticks_ms() <= last_tick:
        return
    Distance = sonar.getDistance() * 10
    if step == 0:
        # 若距离过近
        if 30 < Distance < 180:
            # 亮红灯，执行过渡动作
            sonar.setRGB(0, 250, 0, 0)
            tony.runActionGroup(18, 1)
            last_tick = ticks_ms() + 350
            have_move = True
            step = 1
        # 若距离过远
        elif 300 < Distance < 400:
            # 亮绿灯，执行过渡动作
            sonar.setRGB(0, 0, 250, 0)
            tony.runActionGroup(18, 1)
            last_tick = ticks_ms() + 400
            have_move = True
            step = 2
        elif have_move:
            step = 3
        else:
            sonar.setRGB(0, 0, 0, 250)
            
    elif step == 1:
        if (30 < Distance < 180) or have_move:
            # 执行后退动作
            have_move = False
            tony.runActionGroup(22, 1)
            last_tick = ticks_ms() + 1700
        else:
            step = 3
            
    elif step == 2:
        if (300 < Distance < 400) or have_move:
            # 执行前进动作
            have_move = False
            tony.runActionGroup(21, 1)
            last_tick = ticks_ms() + 1300
        else:
            step = 3
            
    elif step == 3:
        # 执行过渡动作
        tony.runActionGroup(18, 1)
        # 等待动作执行完成
        tony.waitForStop(2000)
        # 执行快速立正动作
        tony.runActionGroup(19, 1)
        sonar.setRGB(0, 0, 0, 50)
        have_move = False
        step = 0


while True:
  Distancewalking()
  time.sleep_ms(100)
