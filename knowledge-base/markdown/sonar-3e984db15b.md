---
doc_id: sonar-3e984db15b
title: "/**************************************************************"
source_path: raw/github/Hiwonder-Tonybot/Arduino/传感器开发课程/摇头避障/Sonar/Sonar.ino
source_type: official
status: processed
---

/**************************************************************
 * company：深圳市幻尔科技有限公司
 * date&&author：20241128&&CuZn
 * description：
**************************************************************/
#include "base_config.h"
#include "HardwareSerial.h" //串口库
#include "LobotServoController.h" //舵机控制器库
#include "Arduino.h"
#include "Servo.h"
#include "HWSensor.h" //传感器库
#include "Hiwonder.hpp"

#define GO_FORWARD  21     /*直走的动作组*/
#define GO_BACK     22     /*后退动作组*/
#define TURN_LEFT   23     /*左转动作组*/
#define TURN_RIGHT  24     /*右转动作组*/

#define MIN_DISTANCE_TURN 150  /*避障距离，就是小于多少距离的时候进行避障*/
#define BIAS 0        /*舵机偏差，根据实际情况调整大小以使超声波朝向正前方 -右 +左*/

LobotServoController Controller(Serial2); //实例化二次开发通信库
HWSensor hwsensor;  //实例化传感器类
Servo sonarServo; //超声波云台舵机控制类实例


int getDistance() {       //获得距离
  uint16_t Distance, distance1, distance2, distance3;
  distance1 = hwsensor.ultrasoundGetDistance();
  distance2 = hwsensor.ultrasoundGetDistance();
  distance3 = hwsensor.ultrasoundGetDistance();
  Distance = (distance1 + distance2 + distance3)/3;
  return Distance;
}


uint16_t gDistance;    //全局变量，用于存储中间位置超声波测得的距离
uint16_t gLDistance;   //用于存储机器人左侧测得的距离
uint16_t gRDistance;   //用于存储机器人右侧测得的距离
void getAllDistance()//获得前及左右三个方向的距离
{
  uint16_t tDistance;     //用于暂存测得距离
  
  hwsensor.ultrasoundColor(0, 50, 50, 0, 50, 50); //蓝绿混
  sonarServo.write(90 + BIAS);   //超声波云台舵机转到90度即中间位置
  delay(100);                    //等待100ms，等待舵机转动到位
  delay(100);
  gDistance = getDistance();     //测量距离，保存到全局变脸gDistance
  
  sonarServo.write(145 + BIAS);  //超声波云台舵机转到130度位置即机器人左面40度位置
  delay(400);     
  delay(100);//延时，等待舵机转动到位
  tDistance = getDistance();     //测量距离，保存到 tDistance
  
  sonarServo.write(180 + BIAS);  //转动到170度，即机器人左侧80度位置
  delay(400); 
  delay(100);//延时，等待舵机转动到位
  gLDistance = getDistance();    //测量距离，保存到gLDistance
  
  if(tDistance < gLDistance)     //比较两个距离，将较小的一个保存到gLDistance
    gLDistance = tDistance;   
  
  sonarServo.write(45 + BIAS);   //超声波云台舵机转到50度位置即机器人右面40度位置    
  delay(600);                    //延时，等待舵机转动到位
  delay(100);
  tDistance = getDistance();     //测量距离，保存到tDistance
  
  sonarServo.write(0 + BIAS);   //转到10度，即机器人右面80度位置
  delay(400);                    //延时，等待舵机转动到位
  delay(100);
  gRDistance = getDistance();    //测量距离，保存到 gRDistance
  
  if(tDistance < gRDistance)     //比较左侧测得的两个距离，取小的一个，保存到gRDistance作为右侧距离
    gRDistance = tDistance;
       
  sonarServo.write(90 + BIAS);   //超声波云台舵机转回中间位置
  delay(400);
}

void sonar()  //避障逻辑
{
  static uint32_t timer = 0;   //静态变量，用于计时
  static uint8_t step = 0;     //静态变量，用于记录步骤
  static bool have_move = false;

  if (timer > millis())  //如果设定时间大于当前毫秒数则返回，否侧继续后续操作
    return;
  switch (step)  //根据step分支
  {
    case 0:  //步骤0
      gDistance = getDistance();   //测量距离，保存到gDistance
      if (gDistance >= MIN_DISTANCE_TURN || gDistance == 0) {  //如果测得距离大于指定的避障距离，前进
        hwsensor.ultrasoundColor(0, 50, 0, 0, 50, 0); //绿色
        Controller.runActionGroup(18, 1);
        delay(400);
        Controller.runActionGroup(GO_FORWARD, 0); //一直前进
        timer = millis() + 1300;
        have_move = true;
        step = 1; //转移到步骤1
      }
      else {  //如果测得距离小于指定距离
        step = 2;  //转移到步骤2
      }
      break; //结束switch语句
    case 1:  //步骤1
      gDistance = getDistance(); //测量距离
      if (gDistance < MIN_DISTANCE_TURN && gDistance > 0) {  //如果测得距离小于指定的避障距离，则停止所有动作组，转移到步骤2
          Controller.runActionGroup(GO_FORWARD, 1);
          delay(1300);
          Controller.runActionGroup(18, 1);
          delay(400);
          Controller.runActionGroup(19, 1);
          timer = millis() + 500;
          step = 2;
      }
      break; //结束switch语句
    case 2:  //步骤2
        getAllDistance();            //获得三个方向的距离
        step = 3; //转移到步骤3
        //此处没有break，执行完后直接之心case 3
      break;  //结束switch
    case 3:  //步骤3
      static bool lastActionIsGoBack = false;   //静态变量，记录最后的动作是不是后退
      hwsensor.ultrasoundColor(0, 0, 50, 0, 0, 50); //蓝
      
      if (((gDistance > MIN_DISTANCE_TURN) || (gDistance == 0)) && lastActionIsGoBack == false) {
        Serial.println("111");
        //中间距离大于指定避障距离且最后的一个动作不是后退，那么就回到步骤0，
        //此处判断最后一个动作是不是后退，是避免程序陷入后退-》前进-》后退-》前进...这样的死循环
        //当最后一步是后退是就不执行前进
        step = 0;
        lastActionIsGoBack = false;
      }
      else if ((((gLDistance > gRDistance) && (gLDistance > MIN_DISTANCE_TURN)) || gLDistance == 0) && gDistance > 50) {
        Serial.println("222");
      //超声波测得左侧的最小距离大于右侧的最小距离大于指定的避障距离，并且中间测得距离大于50mm时
      //检测中间的距离目的是避免有物体处于机器人两个前腿之间，导致机器人无法转向
        if (have_move) {
          Controller.runActionGroup(36, 1);
          delay(600);
        }
        Controller.runActionGroup(TURN_LEFT, 4);  //左转4次，根据实际调节
        timer = millis() + 2200;
        lastActionIsGoBack = false;  //标识最后一个动作不是后退
        step = 2;  //转移到步骤2
      }
      else if ((((gRDistance > gLDistance) && (gRDistance > MIN_DISTANCE_TURN)) || gRDistance == 0) && gDistance > 50) {
        Serial.println("333");
      //超声波测得左侧的最小距离小于右侧的最小距离大于指定的避障距离，并且中间测得距离大于15时
        if (have_move) {
          Controller.runActionGroup(37, 1);
          delay(600);         
        }
        Controller.runActionGroup(TURN_RIGHT, 4);  //右转4次，根据实际调节
        timer = millis() + 2200;
        lastActionIsGoBack = false;  //标识最后一个动作不是后退
        step = 2;  //转移到步骤2
      }
      else {
        Serial.println("444");
        Controller.runActionGroup(18, 1);
        delay(400);
        Controller.runActionGroup(GO_BACK, 2);  //执行后退动作组3次
        delay(3300);
        Controller.runActionGroup(18, 1);
        delay(400);
        Controller.runActionGroup(19, 1);
        delay(600);
        lastActionIsGoBack = true;  //标识最后一个动作是后退
        step = 2;     //转移到步骤2
      }
      have_move = false;
      break;
  }
}


void setup() {
  // 初始化串口通信
  Serial.begin(115200);
  // 初始化与底板通信的串口
  Serial2.begin(9600 , SERIAL_8N1 , IO_BaseRX , IO_BaseTX);
  sonarServo.attach(IO_Servo);         //设定舵机控制io口
  sonarServo.write(90); 
  delay(200); //等待底板初始化完毕
  // 初始化机器人姿态
  Controller.runActionGroup(0 , 1);
  delay(1500);
  Serial.println("start.");
}

void loop() {
  sonar();                    //避障逻辑实现
  delay(100);  //注意需要给相应的延时
}
