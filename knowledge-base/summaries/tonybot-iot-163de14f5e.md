---
doc_id: tonybot-iot-163de14f5e
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/IOT例程/Tonybot_IoT.py
source_type: official
status: processed
---

# import Hiwonder

import Hiwonder
import Hiwonder_IIC
import time
import struct

# 初始化硬件
iic = Hiwonder_IIC.IIC()
tony = Hiwonder.Tonybot()
sonar = Hiwonder_IIC.I2CSonar(iic)
buzzer = Hiwonder.Buzzer()
imu = Hiwonder_IIC.MPU()
cam = Hiwonder_IIC.ESP32S3Cam(iic)

time.sleep_ms(100)
# 设置WiFi名称和密码
iic.writeto(0x69 , "NIOT_Tonybot|||12345678$$$")
time.sleep_ms(1000)

# 初始化机器人
tony.runActionGroup(0, 1)  # 初始化机器人姿态
tony.attachHead()          
tony.moveHeadAngle(90)
time.sleep_ms(200)             
tony.detachHead()         
time.sleep_ms(1000)           # 等待IMU初始化完成
buzzer.playTone(1500, 100, False)

def wifi_send(buf):
  iic.writeto(0x69 , buf)

def wifi_read():
  return iic.readfrom(0x69 , 20)


print("start.")

# 功能开启标志位
onoff_face = False
onoff_undef_obj = False
onoff_hit = False
onoff_color_detec = False
onoff_distance = False

# 功能触发标志位和数据
warn_face = False
warn_undef_obj = False
warn_hit = False
color_detec_num = 0
sensor_distance = 0

def ESP32S3Cam_type():
    """确定ESP32S3Cam的功能类型"""
    result = cam.read_color(3)
    time.sleep_ms(100)
    result = cam.read_color(3)
    print(result)
    if result is not None:
      if result[0] != 0x00 and result[0] == result[2]:
        print("type:face")
        cam.read_face()
        return 1
    print("type:color")
    return 2

esp32s3_type = ESP32S3Cam_type()

def colorDetect():
    """颜色检测函数"""
    res = cam.read_color(1)
    if res is not None:
        if res[2] > 0:
            return 3
    res = cam.read_color(2)
    if res is not None:
        if res[2] > 0:
            return 1
    res = cam.read_color(3)
    if res is not None:
        if res[2] > 0:
            return 2
    return 0

send_step = 0
def sensor_Task():
    """传感器任务"""
    global warn_face, warn_undef_obj, warn_hit, color_detec_num, sensor_distance, send_step
    
    # ES
