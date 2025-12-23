<template>
  <view class="container">
    <!-- Canvas版本（用于导出图片） -->
    <canvas 
      v-if="useCanvas"
      :canvas-id="canvasId" 
      :id="canvasId"
      type="2d"
      :class="'ticket-canvas ' + canvasId"
      :style="{
        width: canvasWidth + 'rpx',
        height: canvasHeight + 'rpx'
      }"
    ></canvas>
    
    <!-- 普通视图版本（用于预览） -->
    <view v-else class="ticket-card">
      <!-- 车票头部信息 -->
      <view class="ticket-header">
        <view class="ticket-number">{{ trainNumber }}</view>
        <view class="check-in">{{
          checkGate ? "检票: " + checkGate : ""
        }}</view>
      </view>

      <!-- 主要行程信息 -->
      <view class="journey-info">
        <view class="station from-station">
          <view>
            <view class="station-name"
              >{{ fromStation }}
              <span class="thin">站</span>
            </view>
            <view class="station-pinyin">{{ fromPinyin }}</view>
          </view>
        </view>

        <view class="train-info">
          <view class="train-number">{{ trainNumber }}</view>
          <view class="direction-arrow">→</view>
        </view>

        <view class="station to-station">
          <view>
            <view class="station-name"
              >{{ toStation }}
              <span class="thin">站</span>
            </view>
            <view class="station-pinyin">{{ toPinyin }}</view>
          </view>
        </view>
      </view>

      <!-- 发车时间和座位信息 -->
      <view class="time-seat-info">
        <view class="departure-time big">
          {{ departureParts.year }}
          <text class="thin"> 年 </text>
          {{ departureParts.month }}
          <text class="thin"> 月 </text>
          {{ departureParts.day }}
          <text class="thin"> 日 </text>
          {{ departureParts.time }}
          <text class="thin"> 开 </text>
        </view>

        <view class="seat-info">{{ seatInfo }}</view>
      </view>

      <!-- 票价信息 -->
      <view class="price-info">
        <text class="price big">{{ price }}<text class="thin"> 元 </text></text>
        <text class="seat-class big">{{ seatClass }}</text>
      </view>

      <!-- 提示信息 -->
      <view class="notice">
        <view class="notice-text">仅供报销使用</view>
      </view>

      <!-- 乘客信息 -->
      <view class="passenger-info big">
        <view class="id-number">{{ maskedId }}</view>
        <view class="passenger-name">{{ passengerName }}</view>
      </view>

      <view class="purchase-info">
        <view>买票请到12306发货请到95306</view>
        <view class="wishes">中国铁路祝您旅途愉快</view>
      </view>
      <!-- 底部信息 -->
      <view class="ticket-code">
        <view class="code-number">{{ codeNumber }}</view>
        <view class="sale-info">{{ saleStation }}</view>
      </view>
      <!-- 二维码区域 -->
      <view class="qrcode-area">
        <block v-if="qrcodeImage">
          <image :src="qrcodeImage" mode="aspectFit" class="qrcode-img" />
        </block>
        <block v-else>
          <view class="qrcode-placeholder">[二维码]</view>
        </block>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, getCurrentInstance } from "vue";
import sampleTicket from "@/utils/sampleTicket";
import { drawTicketToCanvas } from "@/utils/canvasTicket";

// 获取组件实例
const instance = getCurrentInstance();

const props = defineProps({
  ticketData: {
    type: Object,
    default: () => ({}),
  },
  useCanvas: {
    type: Boolean,
    default: false,
  },
  canvasId: {
    type: String,
    default: 'ticketCanvas'
  }
});

// Canvas尺寸
const canvasWidth = ref(750);
const canvasHeight = ref(400);

// 默认数据
const DEFAULT_DATA = {
  trainNumber: "G1234",
  startStation: "",
  endStation: "",
  departureDate: "2023-05-01",
  departureTime: "08:00",
  arrivalTime: "12:30",
  carriage: "",
  seat: "05车12A号",
  seatType: "二等座",
  price: "553.00",
  name: "张三",
  idNumber: "11010119900307XXXX",
  ticketNo: "H123456789",
  saleTime: "2023-04-01 10:30:25",
  saleStation: "北京南站",
  verificationCode: "123456",
  barcodeImages: [],
  barcodeContent: "",
};

// 判断票据数据是否为空
const isTicketDataEmpty = (obj) => {
  if (!obj || !Object.keys(obj).length) return true;
  
  return Object.values(obj).every(v => {
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === "string") return v.trim() === "";
    if (typeof v === "number") return isNaN(v);
    if (v && typeof v === "object") return Object.keys(v).length === 0;
    return !v;
  });
};

// 合并票据数据（空数据时使用示例数据，否则使用默认数据）
const ticketData = computed(() => {
  const data = props.ticketData || {};
  const baseData = isTicketDataEmpty(data) ? sampleTicket : DEFAULT_DATA;
  return { ...baseData, ...data };
});

// 车票基础信息
const trainNumber = computed(() => ticketData.value.trainNumber);
const checkGate = computed(() => ticketData.value.checkGate || "");
const fromStation = computed(() => ticketData.value.startStation || "");
const toStation = computed(() => ticketData.value.endStation || "");
const fromPinyin = computed(() => ticketData.value.fromPinyin || "");
const toPinyin = computed(() => ticketData.value.toPinyin || "");

// 日期时间信息
const departureParts = computed(() => {
  const dateStr = ticketData.value.departureDate || "";
  const [year = "", month = "", day = ""] = dateStr.split(/[-\/]/);
  return {
    year,
    month,
    day,
    time: ticketData.value.departureTime || "",
  };
});

// 座位信息
const seatInfo = computed(() => {
  const { carriage, seat } = ticketData.value;
  const carriageText = carriage ? `${carriage}车` : "";
  return `${carriageText} ${seat || ""}`.trim();
});

// 价格和座位类型
const price = computed(() => ticketData.value.price ? `￥${ticketData.value.price}` : "");
const seatClass = computed(() => ticketData.value.seatType || "");

// 乘客信息
const passengerName = computed(() => ticketData.value.name || "");
const maskedId = computed(() => {
  const id = ticketData.value.idNumber || "";
  if (!id || id.length <= 6) return id;
  return `${id.slice(0, 3)}****${id.slice(-4)}`;
});

// 票务信息
const codeNumber = computed(() => ticketData.value.codeNumber || ""); 
const saleStation = computed(() => ticketData.value.saleStation || "");
const qrcodeImage = computed(() => ticketData.value.wxacodeUrl || null);
// Canvas绘制
const drawCanvas = () => {
  if (!props.useCanvas) return;
  
  console.log('开始绘制Canvas, canvasId:', props.canvasId);
  
  nextTick(() => {
    // 使用组件实例上下文创建查询
    const query = uni.createSelectorQuery().in(instance);
    
    // 使用class选择器而不是id（因为小程序会给id加前缀）
    query.select(`.${props.canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        console.log('Canvas查询结果 (使用class):', res);
        
        if (!res || !res[0] || !res[0].node) {
          console.error('Canvas元素未找到, class:', props.canvasId);
          return;
        }
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        console.log('Canvas元素找到，开始绘制');
        
        // 设置canvas尺寸
        const dpr = uni.getSystemInfoSync().pixelRatio || 1;
        canvas.width = canvasWidth.value * dpr;
        canvas.height = canvasHeight.value * dpr;
        ctx.scale(dpr, dpr);
        
        // 绘制票根
        drawTicketToCanvas(ctx, ticketData.value, canvasWidth.value, canvasHeight.value);
        
        console.log('Canvas绘制完成');
      });
  });
};

// 监听数据变化重新绘制
watch(() => ticketData.value, () => {
  if (props.useCanvas) {
    drawCanvas();
  }
}, { deep: true });

// 监听useCanvas变化
watch(() => props.useCanvas, (newVal) => {
  console.log('useCanvas变化:', newVal);
  if (newVal) {
    console.log('useCanvas为true，将在200ms后绘制');
    setTimeout(() => {
      drawCanvas();
    }, 200);
  }
});

// 组件挂载时绘制
onMounted(() => {
  if (props.useCanvas) {
    console.log('组件挂载，准备绘制Canvas');
    setTimeout(() => {
      drawCanvas();
    }, 200);
  }
});

// 暴露绘制方法供父组件调用
defineExpose({
  drawCanvas
});</script>

<style lang="scss" scoped>
@import "./index.scss";

.ticket-canvas {
  display: block;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
  // 确保canvas有实际尺寸
  min-width: 750rpx;
  min-height: 400rpx;
}
</style>
