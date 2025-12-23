// 短ID生成和转换工具
// 使用base62编码来压缩长ID

const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const BASE = CHARS.length

/**
 * 将长ID（如MongoDB ObjectId）压缩为短字符串
 * @param {string} longId - 原始长ID
 * @returns {string} 压缩后的短ID
 */
export const compressId = (longId) => {
  if (!longId) return ''
  
  // 移除非字母数字字符
  const cleanId = longId.replace(/[^a-zA-Z0-9]/g, '')
  
  // 将16进制字符串转换为大整数，然后编码为base62
  let num = BigInt('0x' + cleanId)
  
  if (num === 0n) return CHARS[0]
  
  let result = ''
  while (num > 0) {
    result = CHARS[Number(num % BigInt(BASE))] + result
    num = num / BigInt(BASE)
  }
  
  return result
}

/**
 * 将压缩的短ID还原为原始长ID（如果需要的话）
 * 注意：这个函数可能无法完全还原原始ID，因为压缩过程中可能丢失信息
 * @param {string} shortId - 压缩的短ID
 * @returns {string} 解压缩的ID
 */
export const decompressId = (shortId) => {
  if (!shortId) return ''
  
  let num = 0n
  for (let i = 0; i < shortId.length; i++) {
    const char = shortId[i]
    const index = CHARS.indexOf(char)
    if (index === -1) continue
    num = num * BigInt(BASE) + BigInt(index)
  }
  
  // 转换回16进制字符串
  let hex = num.toString(16)
  // 补齐24位（MongoDB ObjectId长度）
  hex = hex.padStart(24, '0')
  
  return hex
}

/**
 * 生成一个简短的随机ID
 * @param {number} length - 生成的ID长度，默认8位
 * @returns {string} 短随机ID
 */
export const generateShortId = (length = 8) => {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * BASE)]
  }
  return result
}

/**
 * 基于时间戳生成短ID（保证在短时间内唯一）
 * @param {number} length - ID总长度，默认10位
 * @returns {string} 基于时间的短ID
 */
export const generateTimeBasedShortId = (length = 10) => {
  const timestamp = Date.now()
  let timeStr = timestamp.toString(36) // 使用36进制压缩时间戳
  
  // 如果时间戳转换后长度不够，用随机字符补齐
  const remainLength = Math.max(0, length - timeStr.length)
  const randomStr = generateShortId(remainLength)
  
  return (timeStr + randomStr).substring(0, length)
}