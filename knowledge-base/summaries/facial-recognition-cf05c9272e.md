---
doc_id: facial-recognition-cf05c9272e
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/AI视觉项目课程/7.6 人脸识别/facial_recognition.py
source_type: official
status: processed
---

# import Hiwonder

import Hiwonder
import Hiwonder_IIC
from time import sleep_ms

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
cam = Hiwonder_IIC.ESP32S3Cam(iic)  # ESP32S3Cam通讯对象

# 初始化机器人
tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
sleep_ms(200)             # 等待底板初始化完毕
tony.detachHead()         # 失能舵机接口
sonar.setRGB(0, 0, 0, 0)  # 关闭LED
sleep_ms(2000)

print("start.")

# 主循环
while True:
    # 获取人脸检测结果
    result = cam.read_face()
    
    # 若识别到人脸
    if result is not None:
        tony.runActionGroup(9, 1)  # 执行招手动作
        sleep_ms(3000)
        cam.read_face()  # 清除缓存数据
        
    sleep_ms(100)  # 注意需要给相应的延时
