---
doc_id: ultrasonic-obstacle-avoidance-cd1d26cc42
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/传感器开发课程/摇头避障/ultrasonic_obstacle_avoidance.py
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

# 动作组定义
GO_FORWARD = 21  # 前进动作组
GO_BACK = 22    # 后退动作组
TURN_LEFT = 23  # 左转动作组
TURN_RIGHT = 24 # 右转动作组

# 常量定义
MIN_DISTANCE_TURN = 200  # 避障距离
BIAS = 0                 # 舵机偏差

# 初始化机器人
tony.runActionGroup(0, 1)
tony.attachHead()
time.sleep(1)
tony.detachHead()

# 全局变量
step = 0
last_tick = 0
Distance = 0     # 中间位置距离
LDistance = 0    # 左侧距离
RDistance = 0    # 右侧距离
have_move = False
lastActionIsGoBack = False  # 添加新变量

def getAllDistance():
    """获取三个方向的距离"""
    global Distance, LDistance, RDistance
    
    sonar.setRGB(0, 0, 50, 50)  # 蓝绿混合
    tony.moveHeadAngle(90 + BIAS)  # 中间位置
    sleep_ms(200)
    Distance = sonar.getDistance() * 10
    
    tony.moveHeadAngle(145 + BIAS)  # 左侧40度
    sleep_ms(400)
    temp_distance = sonar.getDistance() * 10
    
    tony.moveHeadAngle(180 + BIAS)  # 左侧80度
    sleep_ms(400)
    LDistance = sonar.getDistance() * 10
    
    if temp_distance < LDistance:  # 取较小值
        LDistance = temp_distance
    
    tony.moveHeadAngle(45 + BIAS)  # 右侧40度
    sleep_ms(600)
    temp_distance = sonar.getDistance() * 10
    
    tony.moveHeadAngle(0 + BIAS)   # 右侧80度
    sleep_ms(400)
    RDistance = sonar.getDistance() * 10
    
    if temp_distance < RDistance:   # 取较小值
        RDistance = temp_distance
    
    tony.moveHeadAngle(90 + BIAS)  # 回到中间
    sleep_ms(400)

def obstacleAvoidance():
    """避障行走任务"""
    global step, last_tick, Distance, have_move, lastActionIsGoBack
    
    if ticks_ms() <= last_tick:
        return
        
    if step == 0:
        Distance = sonar.getDistance() * 10
        if Distance >= MIN_DISTANCE_TURN or Distance == 0:
            sonar.
