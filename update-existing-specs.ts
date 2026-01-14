// 为现有元件数据添加参数提取
// 运行方式: npx tsx update-existing-specs.ts

import { db } from './server/storage.js';
import { components } from './shared/schema.js';
import { eq } from 'drizzle-orm';

// 从描述中提取参数
function extractSpecifications(category: string, description: string): any {
  const specs: any = {};
  
  // 提取封装
  const pkgMatch = description.match(/(0201|0402|0603|0805|1206|1210|SOT-23|SOT-223|TO-220|DIP-\d+|SOIC-\d+|QFN-\d+|DO-214\w*|SMB|SMA)/i);
  if (pkgMatch) {
    specs.package = pkgMatch[1];
  }
  
  switch (category) {
    case 'Capacitors':
      // 提取容值：10nF, 100uF, 2.2uF, 0.1uF 等
      const capMatch = description.match(/(\d+\.?\d*)\s*(pF|nF|µF|uF|mF)/i);
      if (capMatch) {
        specs.capacitance = capMatch[1] + capMatch[2].replace('µ', 'u');
      }
      
      // 提取误差：±10%, ±20% 等
      const tolMatch = description.match(/±\s*(\d+)%/);
      if (tolMatch) {
        specs.tolerance = `±${tolMatch[1]}%`;
      }
      
      // 提取耐压：50V, 16V, 6.3V 等
      const voltMatch = description.match(/(\d+\.?\d*)\s*V(?!\w)/);
      if (voltMatch) {
        specs.voltage = voltMatch[1] + 'V';
      }
      break;
      
    case 'Resistors':
      // 提取阻值：10kΩ, 1MΩ, 100Ω 等
      const resMatch = description.match(/(\d+\.?\d*)\s*(Ω|ohm|kΩ|kohm|MΩ|Mohm)/i);
      if (resMatch) {
        specs.resistance = resMatch[1] + resMatch[2].replace(/ohm/i, 'Ω');
      }
      
      // 提取误差
      const resTolMatch = description.match(/±\s*(\d+)%/);
      if (resTolMatch) {
        specs.tolerance = `±${resTolMatch[1]}%`;
      }
      
      // 提取功率：1/4W, 1/8W 等
      const powerMatch = description.match(/(1\/\d+W|\d+\/\d+W|\d+W)/);
      if (powerMatch) {
        specs.power = powerMatch[1];
      }
      break;
      
    case 'Transistors':
      // 提取类型：NPN, PNP, N-Channel 等
      if (description.match(/NPN/i)) {
        specs.type = 'NPN';
      } else if (description.match(/PNP/i)) {
        specs.type = 'PNP';
      } else if (description.match(/N-Channel|NMOS/i)) {
        specs.type = 'N-Channel MOSFET';
      } else if (description.match(/P-Channel|PMOS/i)) {
        specs.type = 'P-Channel MOSFET';
      }
      
      // 提取耐压
      const transVoltMatch = description.match(/(\d+)\s*V/);
      if (transVoltMatch) {
        specs.voltage = transVoltMatch[1] + 'V';
      }
      
      // 提取电流
      const currentMatch = description.match(/(\d+\.?\d*)\s*(mA|A)/);
      if (currentMatch) {
        specs.current = currentMatch[1] + currentMatch[2];
      }
      break;
      
    case 'Diodes':
      // 提取类型
      if (description.match(/Schottky|肖特基/i)) {
        specs.type = 'Schottky';
      } else if (description.match(/Zener|稳压/i)) {
        specs.type = 'Zener';
      } else if (description.match(/LED|发光/i)) {
        specs.type = 'LED';
      } else if (description.match(/TVS/i)) {
        specs.type = 'TVS';
      }
      
      // 提取电压
      const diodeVoltMatch = description.match(/(\d+\.?\d*)\s*V/);
      if (diodeVoltMatch) {
        specs.voltage = diodeVoltMatch[1] + 'V';
      }
      
      // 提取电流
      const diodeCurrentMatch = description.match(/(\d+\.?\d*)\s*(mA|A)/);
      if (diodeCurrentMatch) {
        specs.current = diodeCurrentMatch[1] + diodeCurrentMatch[2];
      }
      break;
      
    case 'Inductors':
      // 提取电感值
      const indMatch = description.match(/(\d+\.?\d*)\s*(nH|uH|µH|mH)/i);
      if (indMatch) {
        specs.inductance = indMatch[1] + indMatch[2].replace('µ', 'u');
      }
      
      // 提取误差
      const indTolMatch = description.match(/±\s*(\d+)%/);
      if (indTolMatch) {
        specs.tolerance = `±${indTolMatch[1]}%`;
      }
      
      // 提取额定电流
      const indCurrentMatch = description.match(/(\d+\.?\d*)\s*(mA|A)/);
      if (indCurrentMatch) {
        specs.current = indCurrentMatch[1] + indCurrentMatch[2];
      }
      break;
  }
  
  return Object.keys(specs).length > 0 ? specs : null;
}

async function updateExistingComponents() {
  try {
    console.log('开始更新现有元件的参数...');
    
    // 获取所有元件
    const allComponents = await db.select().from(components);
    console.log(`找到 ${allComponents.length} 个元件`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const component of allComponents) {
      // 如果已经有 specifications，跳过
      if (component.specifications && Object.keys(component.specifications).length > 0) {
        console.log(`跳过 ${component.name} - 已有参数`);
        skippedCount++;
        continue;
      }
      
      // 提取参数
      const specs = extractSpecifications(component.category, component.description);
      
      if (specs) {
        // 更新数据库
        await db.update(components)
          .set({ specifications: specs })
          .where(eq(components.id, component.id));
        
        console.log(`✓ 更新 ${component.name}:`, specs);
        updatedCount++;
      } else {
        console.log(`- ${component.name} - 未提取到参数`);
        skippedCount++;
      }
    }
    
    console.log('\n更新完成！');
    console.log(`成功更新: ${updatedCount} 个`);
    console.log(`跳过: ${skippedCount} 个`);
    
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// 运行更新
updateExistingComponents();
