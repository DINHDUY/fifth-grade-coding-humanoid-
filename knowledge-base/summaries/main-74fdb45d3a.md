---
doc_id: main-74fdb45d3a
title: "Hiwonder Tonybot"
source_path: raw/github/Hiwonder-Tonybot/Mobile_APP/main.py
source_type: official
status: processed
---

# Hiwonder Tonybot

# Hiwonder Tonybot
# MicroPython - APP Bluetooth control

import Hiwonder, Hiwonder_IIC, time, machine
from Hiwonder_BLE import BLE

tonybot = Hiwonder.Tonybot()
ble = BLE(BLE.MODE_BLE_SLAVE,"Tonybot_{:02X}".format(machine.unique_id()[5]))
i2c = Hiwonder_IIC.IIC()
i2csonar = Hiwonder_IIC.I2CSonar(i2c)

i2csonar.setRGB(0,0x00,0xF0,0x00)
tonybot.moveHeadAngle(90)
tonybot.runActionGroup(0,1)
time.sleep(1.5)

status_motion = 0 # 要运动的状态
status_action = 0xFF # 要运行的动作组
status_func = 0 # 要运行的玩法

actfirst = 18 
actgo = 21 
actback = 22 
actleftskate = 11 
actrightskate = 12 
actturnleft = 23 
actturnright = 24 
actstandquickly = 19 
action_list = [actfirst , actgo , actback , actleftskate , actrightskate , actturnleft , actturnright]

MIN_DISTANCE_TURN = 200 # 距离阈值
BIAS = 0 # 舵机偏差

_obs_step = 0
gDistance = 0
gLDistance = 0
gRDistance = 0
have_move = False
lastActionIsGoBack = False
_walk_step = 0
battery_volt = 0
l_stop = False
r_stop = False

def ble_receive():
  global status_motion , status_action , status_func
  global battery_volt , l_stop , r_stop

  ble_rec_data = 0
  rec_parse_value = 0
  while True:
    if ble.is_connected():
      if ble.contains_data("CMD"):
        ble_rec_data = ble.read_uart_cmd()
        if not ble_rec_data:
          continue
        rec_parse_value = ble.parse_uart_cmd(ble_rec_data)
        _COMMAND = rec_parse_value[0]
        _COMMAND = int(_COMMAND)
        if(_COMMAND == 1 and len(rec_parse_value) == 2):
          cmd = int(rec_parse_value[1])
          if(cmd == 8):
            l_stop = True
          elif(cmd == 9):
            r_stop = True
          elif(cmd in [1,2,3,4]):
            l_stop = False
          elif(cmd in [5,6]):
            r_stop = False
          status_motion = cmd
        elif(_COMMAND == 2 and len(rec_parse_value)
