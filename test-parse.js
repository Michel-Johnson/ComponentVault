// 测试解析立创商城文件
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';

const file = readFileSync('立创商城订单详情-SO2511034485.xls');
const workbook = XLSX.read(file, { type: 'buffer' });

console.log('工作表名称:', workbook.SheetNames);

const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 转换为 JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('\n总行数:', data.length);
console.log('\n前10行:');
data.slice(0, 10).forEach((row, i) => {
  console.log(`第 ${i} 行:`, row);
});

// 查找表头
for (let i = 0; i < Math.min(data.length, 20); i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;
  
  const rowTexts = row.map(cell => String(cell || '').trim());
  
  if (rowTexts.some(text => text.includes('商品编号') || text.includes('型号'))) {
    console.log('\n找到表头行，索引:', i);
    console.log('表头:', rowTexts);
    
    // 显示接下来的3行数据
    console.log('\n数据行示例:');
    for (let j = i + 1; j < Math.min(i + 4, data.length); j++) {
      console.log(`第 ${j} 行:`, data[j]);
    }
    break;
  }
}
