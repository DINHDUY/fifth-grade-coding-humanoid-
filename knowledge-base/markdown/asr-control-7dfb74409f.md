---
doc_id: asr-control-7dfb74409f
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/语音交互项目课程/语音控制/asr_control.py
source_type: official
status: processed
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

def ASR_task():
    """语音识别函数"""
    result = asr.getResult()  # 获取语音识别模块数据
    if result:
        print("ASR result is:", result)
        
        if result == 0x71:  # 扭腰
            tony.runActionGroup(50, 1)
            
        elif result == 0x72:  # 仰卧起坐
            tony.runActionGroup(8, 1)
            
        elif result == 0x73:  # 鞠躬
            tony.runActionGroup(10, 1)
            
        elif result == 0x74:  # 大鹏展翅
            tony.runActionGroup(17, 1)
            
        elif result == 0x75:  # 招招手
            tony.runActionGroup(9, 1)
            
        elif result == 0x76:  # 原地踏步
            tony.runActionGroup(49, 1)
            
        elif result == 0x01:  # 前进
            tony.runActionGroup(18, 1)
            tony.waitForStop(2000)
            tony.runActionGroup(21, 3)
            tony.waitForStop(5000)
            tony.runActionGroup(18, 1)
            tony.waitForStop(2000)
            tony.runActionGroup(19, 1)
            
        elif result == 0x02:  # 后退
            tony.runActionGroup(18, 1)
            tony.waitForStop(2000)
            tony.runActionGroup(22, 3)
            tony.waitForStop(5000)
            tony.runActionGroup(18, 1)
            tony.waitForStop(2000)
            tony.runActionGroup(19, 1)
            
        elif result == 0x03:  # 左转
            tony.runActionGroup(34, 5)
            
        elif result == 0x04:  # 右转
            tony.runActionGroup(35, 5)
            
        elif result == 0x6E:  # 左脚射门
            tony.runActionGroup(55, 1)
            
        elif result == 0x7A:  # 右勾拳
            tony.runActionGroup(58, 1)

# 主循环
while True:
    ASR_task()  # 语音识别函数
    sleep_ms(50)  # 注意需要给相应的延时
