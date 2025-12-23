<template>
  <view class="create-container">
    <CustomNavBar showBack title="制作票根"> </CustomNavBar>
    <!-- 火车票预览 -->
    <TicketPreview :ticket-data="formData" />
    <!-- 表单部分 -->
    <view class="form-container">
      <view class="sample-row">
        <button class="sample-btn" @click.prevent="fillSample">示例数据</button>
        <button class="debug-btn" @click.prevent="testEnvironment">环境测试</button>
      </view>
      <form @submit="handleSubmit">
        <view class="form-grid">
          <view class="form-item">
            <text class="form-label">票号</text>
            <input
              class="form-input"
              placeholder="例如:E233458"
              :value="formData.ticketNo"
              @input="handleInputChange('ticketNo', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">检票口</text>
            <input
              class="form-input"
              placeholder="检票口"
              :value="formData.checkGate"
              @input="handleInputChange('checkGate', $event)"
            />
          </view>
          <view class="form-item">
            <text class="form-label">始发站</text>
            <input
              class="form-input"
              placeholder="始发站"
              :value="formData.startStation"
              @input="handleInputChange('startStation', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">出发时间</text>
            <picker
              mode="time"
              :value="formData.departureTime"
              @change="handleTimeChange"
            >
              <view class="picker">{{
                formData.departureTime || "请选择时间"
              }}</view>
            </picker>
          </view>

          <view class="form-item">
            <text class="form-label">列车编号</text>
            <input
              class="form-input"
              placeholder="列车编号"
              :value="formData.trainNumber"
              @input="handleInputChange('trainNumber', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">终点站</text>
            <input
              class="form-input"
              placeholder="终点站"
              :value="formData.endStation"
              @input="handleInputChange('endStation', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">始发站拼音</text>
            <input
              class="form-input"
              placeholder="例如：shanghaihongqiao"
              :value="formData.fromPinyin"
              @input="handleInputChange('fromPinyin', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">终点站拼音</text>
            <input
              class="form-input"
              placeholder="例如：beijingzhan"
              :value="formData.toPinyin"
              @input="handleInputChange('toPinyin', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">车厢</text>
            <input
              class="form-input"
              placeholder="车厢"
              :value="formData.carriage"
              @input="handleInputChange('carriage', $event)"
            />
          </view>
          <view class="form-item">
            <text class="form-label">座位</text>
            <input
              class="form-input"
              placeholder="座位"
              :value="formData.seat"
              @input="handleInputChange('seat', $event)"
            />
          </view>
          <view class="form-item">
            <text class="form-label">座位类别</text>
            <input
              class="form-input"
              placeholder="座位类别"
              :value="formData.seatType"
              @input="handleInputChange('seatType', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">票价</text>
            <input
              class="form-input"
              type="digit"
              placeholder="票价"
              :value="formData.price"
              @input="handleInputChange('price', $event)"
            />
          </view>
          <view class="form-item">
            <text class="form-label">乘客姓名</text>
            <input
              class="form-input"
              placeholder="乘客姓名"
              :value="formData.name"
              @input="handleInputChange('name', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">乘客证件</text>
            <input
              class="form-input"
              placeholder="乘客证件"
              :value="formData.idNumber"
              @input="handleInputChange('idNumber', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">条码</text>
            <input
              class="form-input"
              placeholder="验证码或条码内容"
              :value="formData.codeNumber"
              @input="handleInputChange('codeNumber', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">售票车站</text>
            <input
              class="form-input"
              placeholder="售票车站"
              :value="formData.saleStation"
              @input="handleInputChange('saleStation', $event)"
            />
          </view>

          <view class="form-item">
            <text class="form-label">二维码/条形码图片</text>
            <view class="image-uploader">
              <view class="thumb add-thumb" @click="handleChooseImages">+</view>
              <block
                v-for="(img, idx) in formData.barcodeImages"
                :key="img + idx"
              >
                <view class="thumb">
                  <image
                    :src="img"
                    mode="scaleToFill"
                    class="thumb-img"
                  ></image>
                  <button
                    class="remove-btn"
                    @click.stop.prevent="removeImage(idx)"
                  >
                    ×
                  </button>
                </view>
              </block>
            </view>
            <text class="hint"
              >最多可上传 9 张图片，支持本地图片预览和删除</text
            >
          </view>
        </view>

        <button class="confirm-button" type="primary" form-type="submit">
          确定
        </button>
      </form>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import TicketPreview from "../../components/TicketPreview/index.vue";
import CustomNavBar from "@/components/CustomNavBar/index.vue";
import { postImage } from "@/utils/imagePost";
import sampleTicket from "@/utils/sampleTicket";
import { addTickets, updateTicket } from "@/api/tickets";
import { compressId, generateTimeBasedShortId } from "@/utils/shortId";
import { getQRCodeParams, getEnvDescription } from "@/utils/env";
import { testEnvironmentDetection } from "@/utils/envTest";

// 表单数据
const formData = ref({
  departureCity: "", // 出发城市
  arrivalCity: "", // 到达城市
  startStation: "", // 始发站
  endStation: "", // 终点站
  trainNumber: "", // 列车编号
  carriage: "", // 车厢
  seat: "", // 座位
  seatType: "", // 座位类别
  price: "", // 票价
  departureDate: "", // 出发日期
  departureTime: "", // 出发时间
  arrivalTime: "", // 到达时间
  text1: "仅供报销使用", // 文本一
  name: "", // 乘客姓名
  idNumber: "", // 乘客证件
  checkGate: "", // 检票口
  ticketNo: "", // 票号 / 编号一
  barcodeContent: "", // 二维码/条形码内容
  barcodeImages: [], // 二维码/条形码图片数组
  codeNumber: "", // 条码/验证码展示字段
  fromPinyin: "",
  toPinyin: "",
  saleTime: "", // 售票时间
  saleStation: "", // 售票车站
  verificationCode: "", // 验证码
});

// 处理表单输入变化
const handleInputChange = (field, event) => {
  // 兼容 textarea/input/picker 等
  const val =
    event && event.detail && event.detail.value !== undefined
      ? event.detail.value
      : (event && event.target && event.target.value) || "";
  formData.value[field] = val;
};

// 处理日期选择
const handleDateChange = (e) => {
  handleInputChange("departureDate", e);
};

// 处理时间选择
const handleTimeChange = (e) => {
  handleInputChange("departureTime", e);
};

// 处理到达时间选择
const handleArrivalTimeChange = (e) => {
  handleInputChange("arrivalTime", e);
};

// 选择多张图片（uni.chooseImage）
const handleChooseImages = async () => {
  // 限制最多 9 张
  const remain = 9 - (formData.value.barcodeImages || []).length;
  if (remain <= 0) {
    uni.showToast({ title: "最多上传 9 张图片", icon: "none" });
    return;
  }
  uni.chooseImage({
    count: remain,
    sourceType: ["album", "camera"],
    success: (res) => {
      const paths =
        res.tempFilePaths || res.tempFiles?.map((f) => f.path) || [];
      formData.value.barcodeImages = formData.value.barcodeImages.concat(paths);
    },
    fail: () => {
      // 取消选择或失败，不处理
    },
  });
};

const removeImage = (index) => {
  formData.value.barcodeImages.splice(index, 1);
};

// 处理表单提交：组装 payload、简单校验、保存到本地 storage
const handleSubmit = async () => {
  const data = { ...formData.value };

  // 简单校验：至少需要列车编号/出发城市/到达城市/乘客姓名
  const required = ["trainNumber", "departureCity", "arrivalCity", "name"];
  const missing = required.filter(
    (k) => !data[k] || String(data[k]).trim() === ""
  );
  if (missing.length) {
    uni.showToast({ title: `请填写：${missing.join(",")}`, icon: "none" });
    return;
  }

  // 如果有图片，先尝试上传到微信云存储（仅在小程序环境可用）
  let cloudImages = [];
  try {
    if (data.barcodeImages && data.barcodeImages.length) {
      uni.showLoading({ title: "正在上传图片..." });
      // postImage expects an array of { url, noUpload? }
      const filesToPost = (data.barcodeImages || []).map((u) => ({ url: u }));

      cloudImages = await postImage(filesToPost);
      uni.hideLoading();
    }
  } catch (err) {
    uni.hideLoading();
    console.error("上传图片失败", err);
    uni.showToast({ title: "图片上传失败，已保存本地路径", icon: "none" });
    cloudImages = [];
  }
  const payload = {
    ticketNo: data.ticketNo || "",
    trainNumber: data.trainNumber || "",
    departureCity: data.departureCity || "",
    arrivalCity: data.arrivalCity || "",
    startStation: data.startStation || "",
    endStation: data.endStation || "",
    departureDate: data.departureDate || "",
    departureTime: data.departureTime || "",
    arrivalTime: data.arrivalTime || "",
    carriage: data.carriage || "",
    seat: data.seat || "",
    seatType: data.seatType || "",
    price: data.price || "",
    name: data.name || "",
    idNumber: data.idNumber || "",
    checkGate: data.checkGate || "",
    text1: data.text1 || "",
    text2: data.text2 || "",
    barcodeImages: cloudImages.length ? cloudImages : data.barcodeImages || [],
    saleTime: data.saleTime || "",
    saleStation: data.saleStation || "",
    verificationCode: data.verificationCode || "",
    wxacodeUrl: '',
    // 添加短ID字段，用于小程序码场景值
    shortId: generateTimeBasedShortId(8)
  };
  try {
    const storedUser = uni.getStorageSync("userInfo") || null;
    if (storedUser && storedUser._id) {
      payload.userId = storedUser._id;
    }
    uni.showLoading({ title: "正在保存票根..." });
    const res = await addTickets(payload);
    uni.hideLoading();
    
    if (res && res._id) {
      // 生成小程序码
      try {
        uni.showLoading({ title: "正在生成小程序码..." });
        
        // 调用云函数生成小程序码
        // scene 参数格式：ticketId=xxx，最多32个字符
        // 优先使用数据库中的shortId，如果没有则使用压缩的_id
        const scene = payload.shortId || compressId(res._id);
        
        // 获取小程序码生成参数，自动检测环境
        const qrParams = getQRCodeParams({
          scene,
          page: 'pages/preview/index',
          width: 280
        });
        
        console.log(`生成小程序码 - 环境: ${getEnvDescription(qrParams.envVersion)}(${qrParams.envVersion})，场景值: ${scene}`);
        
        const wxacodeResult = await uni.cloud.callFunction({
          name: 'generateQRCode',
          data: qrParams
        });
        
        if (wxacodeResult.result && wxacodeResult.result.success && wxacodeResult.result.fileID) {
          // 更新票根数据，添加小程序码
          await updateTicket(res._id, {
            wxacodeUrl: wxacodeResult.result.fileID,
          });
          
          uni.hideLoading();
          uni.showToast({ title: "票根制作成功", icon: "success" });
        } else {
          uni.hideLoading();
          console.warn('生成小程序码失败:', wxacodeResult.result);
          uni.showToast({ title: "票根保存成功", icon: "success" });
        }
      } catch (wxacodeError) {
        uni.hideLoading();
        console.error("生成小程序码失败:", wxacodeError);
        uni.showToast({ title: "票根保存成功", icon: "success" });
      }
    } else {
      uni.showToast({ title: "票根制作成功", icon: "success" });
    }
    
    // 发送刷新事件给首页
    uni.$emit('refreshTickets');
    
    // 返回上一页
    setTimeout(() => uni.navigateBack(), 600);
  } catch (e) {
    uni.hideLoading();
    console.warn("调用 addTickets 失败", e);
  }
};

const goBack = () => {
  uni.navigateBack();
};

const fillSample = () => {
  Object.keys(sampleTicket).forEach((k) => {
    // 保持响应式引用
    formData.value[k] = sampleTicket[k];
  });
};

const testEnvironment = () => {
  testEnvironmentDetection();
};
</script>

<style lang="scss" scoped>
@import "./index.scss";

.back-btn {
  color: #fff;
  font-size: 22px;
  padding: 6px 10px;
}

.back-img {
  width: 28px;
  height: 28px;
}

.sample-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.debug-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}
</style>
