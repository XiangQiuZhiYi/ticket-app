<template>
  <view class="container">
    <view class="ticket-card">
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
import { computed } from "vue";
import sampleTicket from "@/utils/sampleTicket";

const props = defineProps({
  ticketData: {
    type: Object,
    default: () => ({}),
  },
});

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
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
