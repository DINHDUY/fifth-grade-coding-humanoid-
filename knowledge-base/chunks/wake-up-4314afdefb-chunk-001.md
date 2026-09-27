---
chunk_id: wake-up-4314afdefb-chunk-001
doc_id: wake-up-4314afdefb
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "wake_up"]
---

import Hiwonder
import Hiwonder_IIC
from time import sleep_ms

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
asr = Hiwonder_IIC.asr_module(iic)
imu = Hiwonder_IIC.MPU()

tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
sleep_ms(200)             # 等待底板初始化完毕
tony.detachHead()
sleep_ms(6000)           # 等待IMU初始化完成

step = 0

def tumble():
    """跌倒检测函数"""
    global step
    result = asr.getResult()  # 获取语音识别模块数据
    
    if not tony.isRunning():  # 若无动作进行
        if step == 0:
            if result == 0x77:  # "跌倒起立"
                angle = imu.read_angle()
                radianX = angle[0]  # X轴角度
                # 判断是倒正面还是背面
                if radianX < 60 and radianX > -30:
                    step = 1
                elif radianX > 120 or radianX < -140:
                    step = 2
                    
        elif step == 1:
            tony.runActionGroup(102, 1)  # 恢复立正状态
            step = 0
            
        elif step == 2:
            tony.runActionGroup(101, 1)  # 恢复立正状态
            step = 0
            
        else:
            step = 0

# 主循环
while True:
    tumble()  # 跌倒检测函数
    sleep_ms(50)  # 注意需要给相应的延时
