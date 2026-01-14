// 测试导入解析
import { readFileSync } from 'fs';
import { parseExcelBinary } from './client/src/utils/import-parser.ts';

const file = readFileSync('立创商城订单详情-SO2511034485.xls');
const arrayBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);

console.log('开始解析...\n');

try {
  const components = parseExcelBinary(arrayBuffer);
  
  console.log('\n解析完成！');
  console.log('总共解析了', components.length, '个元件\n');
  
  // 显示前3个元件的详细信息
  components.slice(0, 3).forEach((comp, i) => {
    console.log(`\n元件 ${i + 1}:`);
    console.log('  名称:', comp.name);
    console.log('  类别:', comp.category);
    console.log('  描述:', comp.description);
    console.log('  数量:', comp.quantity);
    console.log('  参数:', JSON.stringify(comp.specifications, null, 2));
  });
  
} catch (error) {
  console.error('解析失败:', error.message);
  console.error(error.stack);
}
