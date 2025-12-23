// 测试短ID功能
import { compressId, decompressId, generateTimeBasedShortId, generateShortId } from './shortId.js'

// 测试数据 - 模拟MongoDB ObjectId
const testIds = [
  '507f1f77bcf86cd799439011',
  '507f191e810c19729de860ea',
  '5f8a7b2345c6789012345678',
]

console.log('=== 短ID功能测试 ===\n')

// 测试ID压缩功能
console.log('1. 测试ID压缩功能:')
testIds.forEach((id, index) => {
  const compressed = compressId(id)
  const decompressed = decompressId(compressed)
  
  console.log(`测试${index + 1}:`)
  console.log(`  原始ID: ${id} (${id.length}字符)`)
  console.log(`  压缩ID: ${compressed} (${compressed.length}字符)`)
  console.log(`  解压ID: ${decompressed} (${decompressed.length}字符)`)
  console.log(`  压缩比: ${Math.round((1 - compressed.length / id.length) * 100)}%`)
  console.log('')
})

// 测试随机短ID生成
console.log('2. 测试随机短ID生成:')
for (let i = 0; i < 5; i++) {
  const shortId = generateShortId(8)
  console.log(`  随机ID${i + 1}: ${shortId}`)
}
console.log('')

// 测试基于时间的短ID生成
console.log('3. 测试基于时间的短ID生成:')
for (let i = 0; i < 5; i++) {
  const timeBasedId = generateTimeBasedShortId(10)
  console.log(`  时间ID${i + 1}: ${timeBasedId}`)
  // 等待1ms以确保时间戳不同
  await new Promise(resolve => setTimeout(resolve, 1))
}

export { testIds }