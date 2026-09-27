---
chunk_id: find-target-53378667c2-chunk-001
doc_id: find-target-53378667c2
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "find_target"]
---

import Hiwonder
import Hiwonder_IIC
import time
from time import ticks_ms, sleep_ms

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)

# 初始化
TURN_RIGHT = 35  # 右转动作组
TURN_LEFT = 34   # 左转动作组
B = 0            # 舵机偏差

# 全局变量
step = 0
distance = 0     # 中间距离
distanceL = 0    # 左边距离
distanceR = 0    # 右边距离
distanceLC = 0   # 左上边距离
distanceRC = 0   # 右上边距离
last_tick = 0


def find_():
    """寻找宝盒任务"""
    global step, last_tick, distance, distanceL, distanceR, distanceLC, distanceRC
    
    if ticks_ms() <= last_tick:
        return
    
    distance = sonar.getDistance() * 10
    
    if step == 0:
        if 30 < distance <= 350:
            tony.detachHead()
            sleep_ms(100)
            sonar.setRGB(0, 50, 50, 50)  # 白色
            step = 0
        else:
            tony.attachHead()
            sonar.setRGB(0, 0, 50, 0)    # 绿色
            step = 1
            
    elif step == 1:
        tony.moveHeadAngle(45 + B)    # 转到右边
        sleep_ms(600)
        distanceR = sonar.getDistance() * 10     # 测量右边距离
        
        tony.moveHeadAngle(0 + B)     # 转到右上
        sleep_ms(600)
        distanceRC = sonar.getDistance() * 10    # 测量右上距离
        
        tony.moveHeadAngle(145 + B)   # 转到左边
        sleep_ms(800)
        distanceL = sonar.getDistance() * 10     # 测量左边距离
        
        tony.moveHeadAngle(180 + B)   # 转到左上
        sleep_ms(600)
        distanceLC = sonar.getDistance() * 10    # 测量左上距离
        
        tony.moveHeadAngle(90 + B)    # 转回中间
        sleep_ms(600)
        step = 2
        
    elif step == 2:
        # 处理超出范围的距离值
        distanceL = 9999 if distanceL == 0 else distanceL
        distanceR = 9999 if distanceR == 0 else distanceR
        distance = 9999 if distance == 0 else distance
        distanceRC = 9999 if distanceRC == 0 else distanceRC
        distanceLC = 9999 if distanceLC == 0 else distanceLC
        
        # 判断转向
        if distanceL < distance and distanceL < distanceR and distanceL < distanceLC and distanceL < distanceRC:
            if distanceL < 350:
                sonar.setRGB(0, 0, 0, 50)  # 蓝色
                tony.runActionGroup(TURN_LEFT, 2)
                last_tick = ticks_ms() + 2500
                
        elif distanceR < distance and distanceR < distanceLC and distanceR < distanceRC:
            if distanceR < 350:
                sonar.setRGB(0, 50, 0, 0)  # 红色
                tony.runActionGroup(TURN_RIGHT, 2)
                last_tick = ticks_ms() + 2500
                
        elif distanceLC < distance and distanceLC < distanceRC:
            if distanceLC < 350:
                sonar.setRGB(0, 0, 0, 50)  # 蓝色
                tony.runActionGroup(TURN_LEFT, 4)
                last_tick = ticks_ms() + 5000
                
        elif distanceRC < distance:
            if distanceRC < 350:
                sonar.setRGB(0, 50, 0, 0)  # 红色
                tony.runActionGroup(TURN_RIGHT, 4)
                last_tick = ticks_ms() + 5000
                
        step = 0

# 主循环
while True:
    find_()
    sleep_ms(100)
