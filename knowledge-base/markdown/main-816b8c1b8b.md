---
doc_id: main-816b8c1b8b
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/AI大模型离线课程/6.8.4 人脸识别/02 人脸识别程序/02 Tonybot人脸识别程序/main.py
source_type: official
status: processed
---

import Hiwonder
import Hiwonder_IIC
import time
import machine

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
sonar.setRGB(0, 0, 0, 0)

i2c = machine.I2C(0, scl=machine.Pin(23), sda=machine.Pin(22), freq=100000)
CAMERA_ADDR = 0x51  # Tonybot_Camera 的 I2C 地址

# 初始化机器人
tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          # 设定舵机控制io口
tony.moveHeadAngle(90)
time.sleep(0.2)            # 等待底板初始化完毕
tony.detachHead()         # 使能舵机接口

time.sleep(2)

print("start.")
def face_detection():
    try:
        # 读取寄存器 0x01 (FACE_DETECTION_REG)，长度 21 字节
        data = i2c.readfrom_mem(CAMERA_ADDR, 0x01, 4)
        
        # 首字节不为 0 即认为识别到人脸
        if data[0] != 0:
            tony.runActionGroup(9, 1)
            time.sleep(5)
    except OSError:
        pass

# 主循环
def loop():
    while True:
        face_detection()
        time.sleep(0.1)  # 注意需要给相应的延时

# 启动程序
if __name__ == '__main__':
    loop()
