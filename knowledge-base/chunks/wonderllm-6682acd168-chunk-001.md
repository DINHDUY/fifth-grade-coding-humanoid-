---
chunk_id: wonderllm-6682acd168-chunk-001
doc_id: wonderllm-6682acd168
title: "include \"WonderLLM.h\""
semantic_key: "include \"WonderLLM.h\""
keywords: ["include", "wonderllm", "raw", "github", "hiwonder-tonybot", "arduino", "line_follow", "cpp"]
---

#include "WonderLLM.h"
#include "hiwonder_i2c.h"
#include "Wire.h"
#include "base_config.h"

#define MAX_FRAME_SIZE 32 // I2C缓冲区大小

WonderLLM_Info WonderLLM_hiwonder;

const char tool_finish[] = 
		"{\"command\":\"mcp_setting\",\"params\":\"true\"}";	

const char tool_buzzer[] = 
		"{\"tool_name\":\"set_buzzer\",\"command\":\"控制机器人的蜂鸣器时调用这个工具。count是蜂鸣器响的次数,freq是蜂鸣器频率,频率范围为100-5000\","
		"\"params\":[[\"count\",\"int\"],[\"freq\",\"int\",100,5000]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_led[] = 
		"{\"tool_name\":\"set_led_color\","
		"\"command\":\"设置左右RGB灯颜色。lr,lg,lb是左灯RGB, rr,rg,rb是右灯RGB, 范围0-255。\","
		"\"params\":[[\"lr\",\"int\",0,255],[\"lg\",\"int\",0,255],[\"lb\",\"int\",0,255],"
		"[\"rr\",\"int\",0,255],[\"rg\",\"int\",0,255],[\"rb\",\"int\",0,255]],"
		"\"block\":\"true\",\"return\":\"false\"}";

// const char tool_ActionGroup[] = 
// 		"{\"tool_name\":\"set_action_group\",\"command\":\"控制机器人执行动作组时调用这个工具。actionNum为动作组代号,"
// 		"0号为立正,1号为前进,2号为后退,3号为单脚左转,4号为单脚右转,7号为俯卧撑,8号为仰卧起坐,9号为挥手,"
// 		"10号为鞠躬,11号为左侧滑,12号为右侧滑,15号为开怀大笑,16号为下蹲,17号为大鹏展翅,23号为原地左转,24号为原地右转,26号为抱娃娃,27号为伸右手,30号为下蹲立正,31号为下蹲前进,101号后倒起立,102号前倒站起,executeNum为动作组运行次数\","
// 		"\"params\":[[\"actionNum\",\"int\",0,200],[\"executeNum\",\"int\"]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_ActionGroup[] = 
		"{\"tool_name\":\"set_action_group\",\"command\":\"控制机器人执行动作组时调用这个工具。actionNum为动作组代号,"
		"0号为立正,1号为前进,2号为后退,3号为单脚左转,4号为单脚右转,7号为俯卧撑,8号为仰卧起坐,9号为挥手,executeNum为动作组运行次数\","
		// "10号为鞠躬,11号为左侧滑,12号为右侧滑,15号为开怀大笑,16号为下蹲,17号为大鹏展翅,23号为原地左转,24号为原地右转,26号为抱娃娃,27号为伸右手,30号为下蹲立正,31号为下蹲前进,101号后倒起立,102号前倒站起,executeNum为动作组运行次数\","
		"\"params\":[[\"actionNum\",\"int\",0,200],[\"executeNum\",\"int\"]],\"block\":\"true\",\"return\":\"false\"}";

const char tool_status[] ="{\"tool_name\":\"self.robot.get_status\",\"command\":\"获取机器人的实时状态时调用这个工具。"
		"可查询的状态包括：'battery', 'distance', 'running_mode','Speed_Mode','poseture','Bodystate'(2为翻倒,1为趴下,0为站立)。\",\"params\":[[\"status_name\",\"string\"]],\"block\":\"true\",\"return\":\"true\"}";

/**
 * @brief 系统延时功能接口
 */
static void delay_ms(int ms_num) {
		delay(ms_num);
}
	
/**
 * @brief 系统实时时间获取接口
 */
static uint32_t Get_time_now() {
		return millis();
}

static uint8_t calculate_checksum(const uint8_t* data, uint16_t len) {
    uint8_t checksum = 0;
    for (uint16_t i = 0; i < len; i++) {
        checksum ^= data[i];
    }
    return checksum;
}

/**
 * @brief IIC速率配置接口
 * @note 涉及较长字符串（尤其是中文）的传输，必须使用调用本函数将IIC速率
 *       提升至400,000，否则WonderLLM将无法完整接收数据 
 */
static void IIC_Config_MCP_Transmit() {
		Wire.setClock(400000);
}

/**
 * @brief IIC速率配置接口
 * @note 1.执行非必要，如果其他IIC设备均支持40W速率通信，则可不必切换回
 *         较低的100W，执行该函数是出于兼容其他低速IIC设备的考虑
 */
static void IIC_Config_normal_Transmit() {
		// 恢复I2C速率
		Wire.setClock(100000);
}

/**
 * @brief IIC扫描接口
 * @note  1.执行非必要，仅是出于程序健壮性的考虑
 */
static bool Detect_WonderLLM() {
    Wire.beginTransmission(WONDERLLM_SLAVE_ADDRESS);
    delay_ms(15); //等待一段时间，等待以上配置写入寄存器内部并生效
    return (Wire.endTransmission() == 0);
}

/**
 * @brief I2C底层数据发送接口
 * @return 0: success.
 *         1: data too long to fit in transmit buffer.
 *         2: received NACK on transmit of address.
 *         3: received NACK on transmit of data.
 *         4: other error.
 *         5: timeout
 */
int WonderLLM_Send_Data(uint8_t* buffer, uint16_t len) {
	if(wireWritemultiByte(WONDERLLM_SLAVE_ADDRESS, buffer, len)){
		return 0;
	}else{
		return 4;
	}
}

static int WonderLLM_Receive_Data(uint8_t* buffer, uint16_t size,bool stop_flag) {
	if(size <= 0) return 0;

    uint16_t index = 0;
	int receive_result = 0;
	uint32_t start_time = 0;

	receive_result = Wire.requestFrom((uint8_t)WONDERLLM_SLAVE_ADDRESS, (size_t)size, (bool)stop_flag);
	if(receive_result == 0){ 
		Serial.println("debug test5");
		return 1;
	} else if(receive_result != size){
		return 3;
	}

	start_time = Get_time_now(); 
	while((index < size) && Wire.available()) {
		buffer[index] = Wire.read();    
		index ++;

		if(Get_time_now() - start_time > 10){
			return 2;
		}
	}

	return 0;
}

/**
 * @brief 将数据帧通过I2C发送出去
 */
static bool send_frame(const uint8_t* data, uint16_t len) {
	// 检查数据和长度是否有效
    if (data == NULL || len == 0) {
        return false;
    }
		
		// 直接发送 data 指针指向的内存区域，长度为 len
    if(WonderLLM_Send_Data((uint8_t *)data,len) !=0){
		return false;
	} 

	return true;
}

/**
 * @brief 接收8字节帧头
 */
static bool receive_frame_head(uint16_t* part_ID, uint16_t* part_num, uint16_t* data_len) {
	uint8_t header[8];

	/*step1 收取“帧头+长度”并校验*/
    if(WonderLLM_Receive_Data(header, 8, true) != 0){
			return false;
	}

	/*step1.1 校验帧头*/
    if (header[0] != 0xAA || header[1] != 0x55) return false;
		delay_ms(1);
    
		/*step1.2 解析帧长度并校验合法性*/
    *data_len = ((uint16_t)header[2] << 8) | header[3];

    if (*data_len == 0|| *data_len > 31){
			Serial.println(F("data abnormal"));
			delay_ms(100);
			return false;
	} 

	#if (debug_mode ==1)
		if(*data_len != 1){
			//控制1个引脚高低电平变化，使用逻辑分析仪同时监测SCL/SDA引脚和该引脚，可以很快定位JSON字符串数据收取时刻
			digitalWrite(6, HIGH);
			Serial.print("rec_dataLen:");
			Serial.println(*data_len);
			digitalWrite(6, LOW);
		}
	#endif

	/*step1.3 解析总分片数和当前分片ID*/
	*part_ID = ((uint16_t)header[5] << 8) | header[4]; 
	*part_num = ((uint16_t)header[7] << 8) | header[6];

	return true;
}

/**
 * @brief 从I2C接收一个完整的数据帧
 */
static bool receive_frame(uint8_t* buffer, uint16_t* len) {
	uint16_t data_len = 0;
	uint16_t data_len_max = 0;
	uint16_t part_ID = 0;
	uint16_t part_num = 0;
	uint16_t buffer_index = 0;
	uint16_t part_ID_temp = 0;
	uint16_t part_num_temp = 0;

	data_len_max = *len;
	*len =0;

	/*step1 接收帧头并校验*/
	if(receive_frame_head(&part_ID, &part_num, &data_len)){
		*len += data_len;
	}else{
		Serial.println(F("receive_frame_fail"));
		return false;
	}

	/*step2 收取“帧数据+校验位”*/
	//如果当前收到的数据包不是第一包，说明前面丢包了，此时收到的是残缺的数据，直接退出
	if(part_ID != 1){
		Serial.println(F("receive_frame_not_first"));
		return false;

	}else{  //从第一包开始连续接收全部数据

		uint8_t result =0;

			//data_len(数据长度)+1(校验位)
			//每1包数据的校验位会在接收下一包数据接收时被覆盖
			//最后1包数据的校验位会被后续构造字符串的‘\0’字符覆盖
		for(int i=1; i<=part_num; i++) {

			delay_ms(10);

			result = WonderLLM_Receive_Data((buffer + buffer_index), data_len + 1, true);			

			//异常处理，判断读取是否正常
			if(result != 0){
				Serial.print("rec_result:");
				Serial.println(result);
				Serial.println(F("receive error"));
				return false;
			}

			//确认校验位合法性
			if (buffer[buffer_index + data_len] == calculate_checksum((buffer + buffer_index), data_len)){

			#if(debug_mode ==1)					
					Serial.print(F("data:"));
					for(uint8_t t=0;t < data_len;t++){
						Serial.print((int)buffer[buffer_index + t]);
						Serial.print(' ');
					}
					Serial.println();
			#endif

				buffer_index += data_len;

			}else{ //校验不合格，清空已经存储的数据并退出

				Serial.println(F("calculate error"));

				#if(debuf_mode ==1)
					/*打印供调试*/
					for(int i=0;i<=(*len);i++){
						Serial.print(buffer[i]);
						Serial.print(' ');
					}
					Serial.println();
				#endif

				memset(buffer,0,sizeof(buffer));
				return false;
			}

			//接收下一包数据的帧头，获取下一包数据的长度、切片ID等信息，为下一包数据的接收做准备
			if(i < part_num){

				delay_ms(100);

				if(receive_frame_head(&part_ID_temp, &part_num_temp, &data_len)){
					*len += data_len;
				}else{
					return false;
				}

				/*验证下一包数据分片ID、总分片数*/
				//下一包数据的分片ID与本包不连续，说明发生丢包，直接退出
				if(( (part_ID + 1) != part_ID_temp ) || (part_num_temp != part_num) ){
					Serial.println(part_ID);
					Serial.println(part_ID_temp);
					Serial.println(F("data packet dropout"));
					return false;
				}else{
					part_ID += 1;
				}

				/*数据防溢出处理，避免越界写入*/
				if((buffer_index + data_len + 1) > data_len_max ){
					Serial.println(F("Insufficient buffer space"));
					return false;
				}
			
			}

		}

		return true;			

	}

    return false;
}



static bool register_tools(void) {
/*
		注册用户自定义mcp工具
	  tool_name：注册的MCP工具名（保持格式`self`开头，命名一定要清晰的让大模型知道它的作用，尽量不要用缩写）
	
		command：引导大模型何时使用该工具，并对需要回传主机的参数进行介绍
	
		params：WonderLLM向主机回传的该类型信息帧中包含的参数，格式:[[参数名1，参数类型，可取值min(非必要，string类型无),可取值max(非必要，string类型无)] ,[参数2...]]
					（string表示该参数项具体内容由大模型给出，根据上下文对话决定）
					（参数类型目前仅支持string、int、bool）
	
		return：表示主机是否需要返回数据给WonderLLM
						true-需要，当为true时，block参数项设置不生效，因为return本身就是阻塞的
						     (使用基础系统指令status，见WonderLLM_Send_Status）
						false-不需要
	
		block：是否为阻塞式执行，若是，则WonderLLM会等待主机回复确认指令执行完成后再继续往下运行
					 true-是，则执行完WonderLLM回传消息帧附带的指令，主机需回复WonderLLM指令执行完成
								（使用基础系统指令action_finish，见WonderLLM_Send_Action_Finish）
					 false-不是，WonderLLM通过信息帧向主机下发指令后直接向后执行，不再关注指令的执行结果
	
*/
	if (!send_frame((uint8_t*)tool_buzzer, strlen(tool_buzzer))){
		return false;
	} 

	if (!send_frame((uint8_t*)tool_led, strlen(tool_led))){
		return false;
	}

	if (!send_frame((uint8_t*)tool_ActionGroup, strlen(tool_ActionGroup))){
		return false;
	}
	
	/*系统指令-MCP注册完成指令*/		
	if (!send_frame((uint8_t*)tool_finish, strlen(tool_finish))){
		return false;
	}
    
    return true;
}

/**
 * @brief 解析收到的JSON指令字符串
 */

static int parse_command(WonderLLM_Info *obj,const char* json_str) {
    /*匹配消息帧中是否有“status_name”，确认其是否属于self.robot.get_status类型消息*/
    /*注意1：get_status类型消息检测必须在set_mode类型消息类检测前进行，
            否则获取运动状态的get_status消息帧因为含running_mode字段
            也会被误判成set_mode类型消息*/
    /*注意2：get_status类型消息检测必须在BaryCenterMove类型消息类检测前进行，原因同上*/
    if (strstr(json_str, "status_name") != NULL) {
		FrameMode mode = Frame_NULL; 
            
		if (strstr(json_str, "distance")) {
				mode = Frame_get_status_distance;
        }
		if (strstr(json_str, "running_mode")) {
				mode = Frame_get_status_running_mode;
        }
		if (strstr(json_str, "Bodystate")) {
				mode = Frame_get_status_Bodystate;
        }

		return mode;
    }
		
	/*匹配消息帧中是否有“lr”，确认其是否属于self.robot.set_led_color类型消息*/
	else if (strstr(json_str, "\"lr\"") != NULL) {
		char* ptr;
		
		ptr = strstr(json_str, "\"lr\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_left[0]));

		ptr = strstr(json_str, "\"lg\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_left[1]));

		ptr = strstr(json_str, "\"lb\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_left[2]));

		ptr = strstr(json_str, "\"rr\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_right[0]));

		ptr = strstr(json_str, "\"rg\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_right[1]));

		ptr = strstr(json_str, "\"rb\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhu", &(obj->rgb_right[2]));

		// 将解析出的值赋给全局的RGB数组
		// 注意进行范围检查和类型转换
		obj->rgb_left[0] = (obj->rgb_left[0] > 255) ? 255 : ((obj->rgb_left[0] < 0) ? 0 : obj->rgb_left[0]);
		obj->rgb_left[1] = (obj->rgb_left[1] > 255) ? 255 : ((obj->rgb_left[1] < 0) ? 0 : obj->rgb_left[1]);
		obj->rgb_left[2] = (obj->rgb_left[2] > 255) ? 255 : ((obj->rgb_left[2] < 0) ? 0 : obj->rgb_left[2]);

		obj->rgb_right[0] = (obj->rgb_right[0] > 255) ? 255 : ((obj->rgb_right[0] < 0) ? 0 : obj->rgb_right[0]);
		obj->rgb_right[1] = (obj->rgb_right[1] > 255) ? 255 : ((obj->rgb_right[1] < 0) ? 0 : obj->rgb_right[1]);
		obj->rgb_right[2] = (obj->rgb_right[2] > 255) ? 255 : ((obj->rgb_right[2] < 0) ? 0 : obj->rgb_right[2]);

		return Frame_set_led_color;
	}
		
    /*匹配消息帧中是否有“count”，确认其是否属于self.robot.set_buzzer类型消息*/
    else if (strstr(json_str, "count") != NULL) {				
        char* ptr;			 

        ptr = strstr(json_str, "\"count\"");		 
        if (ptr){
        sscanf(ptr, "%*[^:]:%hhd", &(obj->buzzer_count));
        } 

        ptr = strstr(json_str, "\"freq\"");		 
        if (ptr){
        sscanf(ptr, "%*[^:]:%hu", &(obj->buzzer_frequency));
        } 

        return Frame_set_buzzer;
    }


	/*匹配消息帧中是否有“actionNum”，确认其是否属于self.robot.ActionGroup类型消息*/
	else if (strstr(json_str, "actionNum") != NULL) {
		char* ptr;

		ptr = strstr(json_str, "\"actionNum\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhd", &(obj->ActionNum));

		ptr = strstr(json_str, "\"executeNum\"");
		if (ptr) sscanf(ptr, "%*[^:]:%hhd", &(obj->ExecuteActionNum));

		return Frame_ActionGroup;
    }
    /*匹配消息帧中是否有“vision”，确认其是否属于系统类型消息*/
    else if (strstr(json_str, "vision") != NULL) {
        // if (strstr(json_str, "true") != NULL) {
        // 	obj->Vision_Result = 1;
        // }else{
        // 	obj->Vision_Result = 0;
        // }

        return Frame_vision_analysis;
    }

		//  /*匹配消息帧中是否有“reply”，确认其是否属于系统类型消息*/
		//  else if (strstr(json_str, "reply") != NULL) {

		// 	 return Frame_reply;
    //  }		
		 return Frame_NULL;		 
}

/**
 * @brief 确认模块是否存在，完成自定义MCP工具注册
 */
bool WonderLLM_Init(void) {
    Wire.setPins(IO_SDA, IO_SCL);
    Wire.setBufferSize(1024);
    Wire.begin();
    uint32_t start_tick =  Get_time_now(); // 记录开始时间

    while (1) {
        // 1. 检查设备是否就绪
        if (Detect_WonderLLM() == true) {
            // 设备找到，执行初始化序列
			IIC_Config_MCP_Transmit();	
            delay_ms(5);
            register_tools(); // 调用MCP写入工具	
			IIC_Config_normal_Transmit();

			return true;

         }else{		// 2. 如果设备未找到，检查是否超时
			if(Get_time_now() - start_tick > 3000){
					// 超过5秒仍未找到设备，初始化失败
					return false;						
			}else{
					// 3. 短暂延时，避免疯狂查询占用CPU和I2C总线
			delay_ms(100); 						
			}
		}  
	}				        
}

void WonderLLM_Info_Get(WonderLLM_Info *obj) {

	obj->Frame_mode = Frame_NULL;
	if (Detect_WonderLLM() == true) {
		obj->Detection_WonderLLM = 1;

		uint16_t received_len = sizeof(obj->json_data_raw);
		//尝试从IIC总线收取数据
		//将wonderllm发来的json字符串原文同步拷贝至json_data_raw备份
		if (receive_frame((uint8_t*)obj->json_data_raw, &received_len)) {
			if (received_len > 0) {
				//将接收信息帧末尾加上 '\0'构造成字符串，便于调用字符串专用的strstr、sscanf等工具函数
				obj->json_data_raw[received_len] = '\0';
				//解析信息帧
				obj->Frame_mode = (FrameMode)parse_command(obj,obj->json_data_raw);
				
			}
		}
	}else{
		obj->Detection_WonderLLM = 0;
	}
}

/**
 * @brief 发送动作执行成功的响应
 * @note 系统指令，参见通信协议
 */

void WonderLLM_Send_Action_Finish(void) {
    char json_str[72];
    snprintf(json_str, sizeof(json_str), "{\"command\":\"action_finish\",\"params\":\"true\"}");
    send_frame((uint8_t*)json_str, strlen(json_str));
}

/**
 * @brief 发送状态信息
 * @note 系统指令，参见通信协议
 */
void WonderLLM_Send_Status(const char* params_str) {
    char json_str[128];
    snprintf(json_str, sizeof(json_str), "{\"command\":\"status\",\"params\":%s}", params_str);
    send_frame((uint8_t*)json_str, strlen(json_str));
}

/**
 * @brief 向 WonderLLM 模块请求进行一次视觉识别
 * @param prompt 描述你想让大模型做什么的字符串
 * @note 1.系统指令，参见通信协议
 *       2.传入的提示符字符串内部不能包含双引号，否则会导致WonderLLM解析失败
 *       3.涉及较长字符串（尤其是中文）的传输，必须使用调用IIC_Config_MCP_Transmit将IIC速率
 *         提升至400,000，否则WonderLLM将无法完整接收数据
 *       4.模块完成配网前(白色滚动条消失出现表情界面)，该功能无效     
 */
void WonderLLM_Request_Vision(const char* prompt) {
    char json_str[256];
    
    // 使用 snprintf 安全地构建 JSON 字符串
    snprintf(json_str, sizeof(json_str), 
             "{\"tool_name\":\"mcu.request\",\"command\":\"vision\",\"params\":\"%s\"}", 
             prompt);
		
	IIC_Config_MCP_Transmit();				
						
    delay_ms(5);
		
    // 调用已有的 send_frame 函数发送这个请求
    send_frame((uint8_t*)json_str, strlen(json_str));
}
