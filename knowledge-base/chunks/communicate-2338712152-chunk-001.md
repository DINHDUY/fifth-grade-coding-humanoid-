---
chunk_id: communicate-2338712152-chunk-001
doc_id: communicate-2338712152
title: "import Hiwonder"
semantic_key: "import Hiwonder"
keywords: ["import", "hiwonder", "raw", "github", "hiwonder-tonybot", "python", "communicate"]
---

import Hiwonder
import Hiwonder_IIC
from time import sleep_ms

iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
asr = Hiwonder_IIC.asr_module(iic)

tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
sleep_ms(200)             # 等待底板初始化完毕
tony.detachHead()

def communicate():
    """语音识别函数"""
    result = asr.getResult()  # 获取语音识别模块数据
    if result:
        print("ASR result is:", result)
        
        if result == 0x1A:  # 你好
            tony.runActionGroup(10, 1)
            sleep_ms(1000)
            
        elif result == 0x1B:  # 介绍自己
            tony.runActionGroup(48, 1)
            sleep_ms(4000)
            
        elif result == 0x1C:  # 露一手
            sleep_ms(500)
            tony.runActionGroup(17, 1)
            sleep_ms(10000)
            
        elif result == 0x1D:  # 走两步
            sleep_ms(500)
            tony.runActionGroup(18, 1)
            tony.waitForStop(2000)
            tony.runActionGroup(21, 3)
            tony.waitForStop(5000)
            tony.runActionGroup(18, 1)
            tony.waitForStop(2000)
            tony.runActionGroup(19, 1)
            
        elif result == 0x1E:  # 摇头
            tony.attachHead()
            sleep_ms(1000)
            tony.moveHeadAngle(135)
            sleep_ms(400)
            tony.moveHeadAngle(45)
            sleep_ms(400)
            tony.moveHeadAngle(135)
            sleep_ms(400)
            tony.moveHeadAngle(90)
            sleep_ms(400)
            tony.detachHead()

# 主循环
while True:
    communicate()  # 语音识别函数
    sleep_ms(50)  # 注意需要给相应的延时
