---
chunk_id: rise-after-fall-81703920de-chunk-001
doc_id: rise-after-fall-81703920de
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "rise_after_fall"]
---

import Hiwonder
import Hiwonder_IIC
import time
from time import ticks_ms, sleep_ms

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
buzzer = Hiwonder.Buzzer()
imu = Hiwonder_IIC.MPU()

# 初始化机器人
tony.runActionGroup(0, 1)
time.sleep(6)  # 等待IMU初始化完成
buzzer.playTone(1500, 100, False)

# 全局变量
step = 0
last_tick = 0
count1 = 0
count2 = 0

def tumble():
    """跌倒起立任务"""
    global step, last_tick, count1, count2
    
    if ticks_ms() <= last_tick:
        return
        
    if step == 0:
        # 获取IMU数据，使用 read_angle() 方法
        angle = imu.read_angle()
        radianX = angle[0]  # X轴角度
        
        # 若为前倒
        if -30 < radianX < 60:
            count1 += 1
            last_tick = ticks_ms() + 50
            if count1 > 50:
                count1 = 0
                step = 1
                buzzer.playTone(1500, 100, False)
                last_tick = ticks_ms() + 1000
                
        # 若为后倒
        elif radianX > 120 or radianX < -140:
            count2 += 1
            last_tick = ticks_ms() + 50
            if count2 > 50:
                count2 = 0
                step = 2
                buzzer.playTone(1500, 100, False)
                last_tick = ticks_ms() + 1000
                
        # 若没倒
        else:
            count1 = 0
            count2 = 0
            
    elif step == 1:
        tony.runActionGroup(102, 1)  # 前倒恢复立正状态
        last_tick = ticks_ms() + 7000
        step = 0
        
    elif step == 2:
        tony.runActionGroup(101, 1)  # 后倒恢复立正状态
        last_tick = ticks_ms() + 7000
        step = 0

# 主循环
while True:
    tumble()
    sleep_ms(50)
