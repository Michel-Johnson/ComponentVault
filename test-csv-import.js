// 测试 CSV 导入
import { readFileSync } from 'fs';
import { parseCSV } from './client/src/utils/import-parser.ts';

const content = readFileSync('inventory-export-2026-01-14.csv', 'utf-8');

console.log('CSV 内容前 500 字符:');
console.log(content.substring(0, 500));
console.log('\n开始解析...\n');

try {
  const components = parseCSV(content);
  
  console.log('解析成功！');
  console.log('总共解析了', components.length, '个元件\n');
  
  // 显示前2个元件
  components.slice(0, 2).forEach((comp, i) => {
    console.log(`元件 ${i + 1}:`);
    console.log('  ID:', comp.id || '无');
    console.log('  名称:', comp.name);
    console.log('  类别:', comp.category);
    console.log('  数量:', comp.quantity);
    console.log('  参数:', JSON.stringify(comp.specifications, null, 2));
    console.log('');
  });
  
} catch (error) {
  console.error('解析失败:', error.message);
  console.error(error.stack);
}
