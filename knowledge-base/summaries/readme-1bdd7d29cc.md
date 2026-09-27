---
doc_id: readme-1bdd7d29cc
title: "颜色识别IIC寄存器"
source_path: raw/github/Hiwonder-Tonybot/Python/IOT例程/02 ESP32S3-Cam颜色识别例程及工具/ColorDetection/README.md
source_type: official
status: processed
---

# 颜色识别IIC寄存器

# 颜色识别IIC寄存器

## 设备地址：0x52



- ### 颜色识别

  | 寄存器地址 |                   数据格式(unsigned char)                    |
  | :--------: | :----------------------------------------------------------: |
  |    0x00    | data[0]:红色中心X轴坐标<br/>data[1]:红色中心Y轴坐标<br/>data[2]:红色检测框宽度<br/>data[3]:红色检测框长度<br/> |
  |    0x01    | data[0]:蓝色中心X轴坐标<br/>data[1]:蓝色中心Y轴坐标<br/>data[2]:蓝色检测框宽度<br/>data[3]:蓝色检测框长度<br/> |
