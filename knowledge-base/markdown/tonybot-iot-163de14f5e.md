---
doc_id: tonybot-iot-163de14f5e
title: "import Hiwonder"
source_path: raw/github/Hiwonder-Tonybot/Python/IOT例程/Tonybot_IoT.py
source_type: official
status: processed
---

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
    
    # ESP32S3视觉模块检测
    if esp32s3_type == 1:  # 人脸检测
        if onoff_face:
            result = cam.read_face()
            print(result)
            if result[2] > 0:
              warn_face = True
            else:
              warn_face = False
        else:
            warn_face = False
            
    elif esp32s3_type == 2:  # 颜色检测
        if onoff_color_detec:
            color_detec_num = colorDetect()
            print(color_detec_num)
        else:
            color_detec_num = 0
            
    # 超声波测距
    sensor_distance = sonar.getDistance() * 10
    
    # 不明物体检测
    if onoff_undef_obj:
        warn_undef_obj = True if sensor_distance < 200 else False
    else:
        warn_undef_obj = False
        
    # IMU检测
    if onoff_hit:
        angle = imu.read_angle()
        roll = angle[0]
        warn_hit = True if roll < 70 or roll > 110 else False
    else:
        warn_hit = False
    
    if send_step == 0:
      send_step = 1
      # 发送状态数据
      wifi_send("CMD|1|{}|{}|{}|$".format(
          1 if warn_face else 0,
          1 if warn_undef_obj else 0,
          1 if warn_hit else 0
      ))
    elif send_step == 1:
      send_step = 2
      # 发送距离数据
      if onoff_distance:
          wifi_send("CMD|3|{}|$".format(int(sensor_distance//10)))
    elif send_step == 2:
      send_step = 0
    # 发送颜色数据
      if onoff_color_detec:
          wifi_send("CMD|2|{}|$".format(color_detec_num))

last_receive = None
receive_data = None
buzzer_flag = False

def wifi_receive_Task():
    """WiFi接收任务"""
    global onoff_face, onoff_undef_obj, onoff_hit, onoff_color_detec, onoff_distance,last_receive,receive_data,buzzer_flag
    
    receive_data = wifi_read()
    if last_receive != receive_data:
        last_receive = receive_data
        rec = receive_data.decode('utf-8')
        print(rec)
        if rec.find("CMD") != -1 and rec.find("$"):
          cmd = rec.split('|')[1:]
          print(cmd)

          if not cmd or not cmd[0].isdigit():  # 检查是否为数字字符串
            return
          
          if int(cmd[0]) == 1:  # 人脸检测等功能
              onoff_face = bool(int(cmd[1]))
              onoff_undef_obj = bool(int(cmd[2]))
              onoff_hit = bool(int(cmd[3]))
              
          elif int(cmd[0]) == 2:  # 颜色检测功能
              onoff_color_detec = bool(int(cmd[1]))
              
          elif int(cmd[0]) == 3:  # 超声波测距功能
              onoff_distance = bool(int(cmd[1]))
              
          elif int(cmd[0]) == 4:  # 超声波LED控制
              sonar.setRGB(0, int(cmd[1]), int(cmd[2]), int(cmd[3]))
              
          elif int(cmd[0]) == 5:  # 报警功能
              print("55")
              if int(cmd[1]):
                  print("55-1")
                  buzzer_flag = True
              else:
                  print("55-2")
                  buzzer_flag = False
                  
          elif int(cmd[0]) == 6:  # 动作组控制
              action_num = int(cmd[2])
              if not tony.isRunning():
                  if action_num in [16, 30, 77]:  # 下蹲姿态
                      tony.runActionGroup(action_num, 1)
                  else:
                      tony.runActionGroup(19, 1)  # 快速立正
                      time.sleep_ms(600)
                      tony.runActionGroup(action_num, 1)
                      
          elif int(cmd[0]) == 7:  # 视觉模块类型询问
              wifi_send("CMD|7|{}|$".format(esp32s3_type))

buzzer_time = 0
def buzzer_Task():
    """蜂鸣器任务"""
    global buzzer , buzzer_time , buzzer_flag
    if time.ticks_ms() - buzzer_time > 500:
        buzzer_time = time.ticks_ms()
        if buzzer_flag:
            buzzer.playTone(1500, 200, False)

# 主循环
while True:
    wifi_receive_Task()   # WiFi接收任务
    sensor_Task()         # 传感器任务
    buzzer_Task()         # 蜂鸣器任务
    time.sleep_ms(50)         # 延时
