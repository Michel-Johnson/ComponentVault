// 立创商城订单导入解析工具
import * as XLSX from 'xlsx';

export interface ParsedComponent {
  name: string;
  description: string;
  category: string;
  quantity: number;
  location: string;
  minStockLevel: number;  // 修改为 minStockLevel 以匹配 schema
  specifications?: any;  // 元件参数
}

// 字段映射（支持立创商城和软件自己的导出格式）
const FIELD_MAPPING = {
  // ID 字段（软件导出格式）
  id: ['ID', 'id'],
  // 名称字段（软件导出 + 立创商城）
  name: ['Name', 'name', '商品编号', 'LCSC Part'],
  // 描述字段
  description: ['Description', 'description', '商品名称'],
  // 类别字段
  category: ['Category', 'category', '类别'],
  // 数量字段
  quantity: ['Quantity', 'quantity', '订购数量', '数量', '订购数量（修改后）'],
  // 位置字段
  location: ['Location', 'location', '位置'],
  // 最小库存字段
  minStockLevel: ['Min Stock Level', 'minStockLevel', 'Min Stock', 'minStock'],
  // 参数字段
  specifications: ['Specifications', 'specifications', 'specs'],
  // 立创商城特有字段
  brand: ['品牌', 'Brand'],
  package: ['封装', 'Package'],
  attributes: ['商品属性', '规格', '属性'],
  modelNumber: ['厂家型号', '型号'],
};

// 检测字段名称
function detectFieldName(headers: string[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].trim();
    if (possibleNames.some(name => header.includes(name))) {
      return i;
    }
  }
  return -1;
}

// 自动检测分类
function autoDetectCategory(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase();
  
  // 集成电路
  if (text.match(/atmega|stm32|esp32|pic|mcu|microcontroller|processor|ic|芯片|单片机|sop|ssop|tssop|qfn|lqfp/)) {
    return 'Integrated Circuits';
  }
  
  // 电阻
  if (text.match(/resistor|ohm|Ω|kω|mω|电阻|贴片电阻|\d+r\d+|\d+k\d+|\d+m\d+/)) {
    return 'Resistors';
  }
  
  // 电容
  if (text.match(/capacitor|farad|µf|uf|pf|nf|电容|贴片电容|钽电容|电解电容/)) {
    return 'Capacitors';
  }
  
  // 晶体管
  if (text.match(/transistor|mosfet|bjt|fet|晶体管|三极管|mos管|n-channel|p-channel|npn|pnp/)) {
    return 'Transistors';
  }
  
  // 二极管（包括 TVS、LED 等）
  if (text.match(/diode|led|zener|schottky|tvs|esd|二极管|发光二极管|整流|稳压二极管|肖特基/)) {
    return 'Diodes';
  }
  
  // 连接器
  if (text.match(/connector|header|socket|plug|usb|type-c|type-a|hdmi|rj45|连接器|排针|排母|接插件|插座/)) {
    return 'Connectors';
  }
  
  // 电感
  if (text.match(/inductor|inductance|uh|nh|mh|电感|贴片电感/)) {
    return 'Inductors';
  }
  
  // 传感器
  if (text.match(/sensor|temperature|humidity|pressure|accelerometer|gyro|传感器|温度|湿度|压力|加速度/)) {
    return 'Sensors';
  }
  
  // 开关
  if (text.match(/switch|button|key|开关|按键|轻触开关/)) {
    return 'Switches';
  }
  
  return 'Other';
}

// 从描述中提取参数
function extractSpecifications(category: string, pkg: string, description: string, model: string): any {
  const specs: any = {};
  
  console.log('提取参数 - 类别:', category, '封装:', pkg, '描述:', description.substring(0, 50));
  
  // 封装（如果有）
  if (pkg) {
    specs.package = pkg;
  }
  
  switch (category) {
    case 'Capacitors':
      // 提取容值：10nF, 100uF, 2.2uF, 0.1uF 等
      const capMatch = description.match(/(\d+\.?\d*)\s*(pF|nF|µF|uF|mF)/i);
      if (capMatch) {
        specs.capacitance = capMatch[1] + capMatch[2].replace('µ', 'u');
        console.log('  找到容值:', specs.capacitance);
      }
      
      // 提取误差：±10%, ±20% 等
      const tolMatch = description.match(/±\s*(\d+)%/);
      if (tolMatch) {
        specs.tolerance = `±${tolMatch[1]}%`;
        console.log('  找到误差:', specs.tolerance);
      }
      
      // 提取耐压：50V, 16V, 6.3V 等
      const voltMatch = description.match(/(\d+\.?\d*)\s*V(?!\w)/);
      if (voltMatch) {
        specs.voltage = voltMatch[1] + 'V';
        console.log('  找到耐压:', specs.voltage);
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
      
    case 'Integrated Circuits':
      if (model) {
        specs.model = model;
      }
      
      // 提取工作电压
      const icVoltMatch = description.match(/(\d+\.?\d*)\s*V/);
      if (icVoltMatch) {
        specs.voltage = icVoltMatch[1] + 'V';
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
      
    case 'Connectors':
      // 提取类型
      if (description.match(/USB/i)) {
        specs.type = 'USB';
      } else if (description.match(/Type-C/i)) {
        specs.type = 'Type-C';
      } else if (description.match(/Type-A/i)) {
        specs.type = 'Type-A';
      } else if (description.match(/Header|排针/i)) {
        specs.type = 'Header';
      } else if (description.match(/Socket|排母/i)) {
        specs.type = 'Socket';
      }
      
      // 提取引脚数
      const pinsMatch = description.match(/(\d+)\s*(pin|P|位|芯|脚)/i);
      if (pinsMatch) {
        specs.pins = pinsMatch[1];
      }
      
      // 提取间距
      const pitchMatch = description.match(/(\d+\.?\d*)\s*mm/);
      if (pitchMatch) {
        specs.pitch = pitchMatch[1] + 'mm';
      }
      
      // 提取电流
      const connCurrentMatch = description.match(/(\d+\.?\d*)\s*(mA|A)/);
      if (connCurrentMatch) {
        specs.current = connCurrentMatch[1] + connCurrentMatch[2];
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
  
  const result = Object.keys(specs).length > 0 ? specs : undefined;
  console.log('提取结果:', result);
  return result;
}

// 解析二进制 Excel 文件（立创商城订单）
export function parseExcelBinary(arrayBuffer: ArrayBuffer): ParsedComponent[] {
  console.log('开始解析二进制 Excel 文件');
  
  try {
    // 使用 xlsx 库解析
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // 获取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为 JSON
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('工作表名称:', sheetName);
    console.log('总行数:', data.length);
    console.log('前5行:', data.slice(0, 5));
    
    if (data.length < 2) {
      throw new Error('表格数据不足，请确保文件是立创商城订单');
    }
    
    // 查找表头行
    let headerRowIndex = -1;
    let headers: string[] = [];
    
    for (let i = 0; i < Math.min(data.length, 50); i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      const rowTexts = row.map(cell => String(cell || '').trim());
      console.log(`第 ${i} 行:`, rowTexts.slice(0, 8));
      
      // 检查是否包含关键字段（软件导出格式或立创商城格式）
      const hasSoftwareHeaders = rowTexts.some(text => 
        text === 'ID' || text === 'Name' || text === 'Category' || 
        text === 'Description' || text === 'Min Stock Level'
      );
      const hasLCSCHeaders = rowTexts.some(text => 
        text.includes('商品编号') || text.includes('型号') || text.includes('序号')
      );
      
      if (hasSoftwareHeaders || hasLCSCHeaders) {
        headerRowIndex = i;
        headers = rowTexts;
        console.log('找到表头行，索引:', i);
        console.log('表头:', headers);
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      throw new Error('未找到表头行，请确保文件包含必需的字段');
    }
    
    // 检测字段位置
    const idIndex = detectFieldName(headers, FIELD_MAPPING.id);
    const nameIndex = detectFieldName(headers, FIELD_MAPPING.name);
    const descIndex = detectFieldName(headers, FIELD_MAPPING.description);
    const categoryIndex = detectFieldName(headers, FIELD_MAPPING.category);
    const qtyIndex = detectFieldName(headers, FIELD_MAPPING.quantity);
    const locationIndex = detectFieldName(headers, FIELD_MAPPING.location);
    const minStockIndex = detectFieldName(headers, FIELD_MAPPING.minStockLevel);
    
    // 立创商城特有字段
    const brandIndex = detectFieldName(headers, FIELD_MAPPING.brand);
    const packageIndex = detectFieldName(headers, FIELD_MAPPING.package);
    const attrIndex = detectFieldName(headers, FIELD_MAPPING.attributes);
    const modelIndex = detectFieldName(headers, FIELD_MAPPING.modelNumber);
    
    console.log('字段位置:', {
      idIndex,
      nameIndex,
      descIndex,
      categoryIndex,
      qtyIndex,
      locationIndex,
      minStockIndex,
      brandIndex,
      packageIndex,
      attrIndex,
      modelIndex
    });
    
    // 判断是软件导出格式还是立创商城格式
    // 软件导出格式的特征：有 ID、Category、Description 字段
    // 立创商城格式的特征：有 品牌、封装、厂家型号 字段
    const hasSoftwareFields = idIndex !== -1 && categoryIndex !== -1 && descIndex !== -1;
    const hasLCSCFields = brandIndex !== -1 || packageIndex !== -1 || modelIndex !== -1;
    
    // 优先判断：如果有 ID 和 Category，肯定是软件导出格式
    const isSoftwareExport = hasSoftwareFields && !hasLCSCFields;
    
    console.log('格式判断:', { 
      isSoftwareExport, 
      hasSoftwareFields, 
      hasLCSCFields 
    });
    
    if (!isSoftwareExport && nameIndex === -1) {
      throw new Error('未找到名称字段');
    }
    
    if (qtyIndex === -1) {
      throw new Error('未找到数量字段');
    }
    
    // 解析数据行
    const components: any[] = [];
    
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      const values = row.map(cell => String(cell || '').trim());
      
      if (isSoftwareExport) {
        // 软件导出格式：直接使用字段值
        const id = idIndex !== -1 ? values[idIndex] : undefined;
        const name = values[nameIndex] || '';
        const description = descIndex !== -1 ? values[descIndex] : '';
        const category = categoryIndex !== -1 ? values[categoryIndex] : 'Other';
        const quantity = parseInt(values[qtyIndex]?.replace(/[^\d]/g, '') || '0') || 0;
        const location = locationIndex !== -1 ? values[locationIndex] : '';
        const minStockLevel = minStockIndex !== -1 ? parseInt(values[minStockIndex] || '10') : 10;
        
        console.log(`第 ${i} 行数据:`, { id, name, category, quantity });
        
        if (!name) continue;
        
        // 尝试从描述中提取参数（如果描述中包含参数信息）
        const specifications = description ? extractSpecifications(category, '', description, '') : undefined;
        
        const component: any = {
          name,
          description,
          category,
          quantity,
          location,
          minStockLevel,
          specifications
        };
        
        // 如果有 ID，添加到组件对象中
        if (id) {
          component.id = id;
        }
        
        components.push(component);
        console.log('添加组件:', component);
      } else {
        // 立创商城格式：需要构建描述和自动分类
        const partNumber = values[nameIndex] || '';
        const brand = brandIndex !== -1 ? values[brandIndex] : '';
        const pkg = packageIndex !== -1 ? values[packageIndex] : '';
        const desc = descIndex !== -1 ? values[descIndex] : '';
        const attr = attrIndex !== -1 ? values[attrIndex] : '';
        const model = modelIndex !== -1 ? values[modelIndex] : '';
        const qtyStr = values[qtyIndex] || '0';
        
        console.log(`第 ${i} 行数据:`, { partNumber, model, brand, pkg, qtyStr });
        
        // 跳过空行或序号行（纯数字且小于100）
        if (!partNumber || (partNumber.match(/^\d+$/) && parseInt(partNumber) < 100)) continue;
        
        // 构建描述：优先使用厂家型号，然后是商品名称/属性
        let fullDescription = model || attr || desc;
        if (brand && !fullDescription.includes(brand)) {
          fullDescription = brand + (fullDescription ? ' - ' + fullDescription : '');
        }
        if (pkg && !fullDescription.includes(pkg)) {
          fullDescription += (fullDescription ? ' | ' : '') + pkg;
        }
        // 如果有商品名称且不在描述中，添加到末尾
        if (desc && !fullDescription.includes(desc)) {
          fullDescription += (fullDescription ? ' | ' : '') + desc;
        }
        
        const quantity = parseInt(qtyStr.replace(/[^\d]/g, '')) || 0;
        if (quantity === 0) continue;
        
        const category = autoDetectCategory(partNumber, fullDescription);
        
        // 提取参数
        const specifications = extractSpecifications(category, pkg, fullDescription, model);
        
        const newComponent = {
          name: partNumber,
          description: fullDescription || partNumber,
          category,
          quantity,
          location: '',
          minStockLevel: Math.max(Math.floor(quantity * 0.2), 5),
          specifications
        };
        
        components.push(newComponent);
        
        console.log('添加组件:', newComponent);
      }
    }
    
    console.log('解析完成，共', components.length, '个组件');
    
    if (components.length === 0) {
      throw new Error('未找到有效的组件数据，请检查文件格式');
    }
    
    return components;
  } catch (error: any) {
    console.error('解析 Excel 文件失败:', error);
    throw new Error(`解析失败: ${error.message}`);
  }
}

// 解析 Excel HTML 格式（立创商城订单）
export function parseExcelHTML(content: string): ParsedComponent[] {
  console.log('开始解析 Excel HTML，内容长度:', content.length);
  
  // 尝试多种方式提取表格
  let tableContent = '';
  
  // 方法1：查找 <table> 标签
  const tableMatch = content.match(/<table[^>]*>([\s\S]*?)<\/table>/i);
  if (tableMatch) {
    tableContent = tableMatch[1];
    console.log('找到 table 标签');
  } else {
    // 方法2：查找 <Table> 标签（大写）
    const tableMatch2 = content.match(/<Table[^>]*>([\s\S]*?)<\/Table>/i);
    if (tableMatch2) {
      tableContent = tableMatch2[1];
      console.log('找到 Table 标签（大写）');
    } else {
      // 方法3：尝试直接解析 tr 标签
      console.log('未找到 table 标签，尝试直接查找 tr');
      tableContent = content;
    }
  }

  // 提取所有行
  const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || 
                tableContent.match(/<TR[^>]*>([\s\S]*?)<\/TR>/gi) || [];
  
  console.log('找到行数:', rows.length);
  
  if (rows.length < 2) {
    throw new Error('表格数据不足，请确保文件是立创商城订单');
  }

  // 查找表头行
  let headerRowIndex = -1;
  let headers: string[] = [];
  
  for (let i = 0; i < Math.min(rows.length, 50); i++) {
    const row = rows[i];
    const cells = row.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || 
                  row.match(/<T[HD][^>]*>([\s\S]*?)<\/T[HD]>/gi) || [];
    const cellTexts = cells.map(cell => {
      // 移除所有 HTML 标签
      let text = cell.replace(/<[^>]+>/g, '');
      // 解码 HTML 实体
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&amp;/g, '&');
      return text.trim();
    });
    
    console.log(`第 ${i} 行单元格:`, cellTexts.slice(0, 5));
    
    // 检查是否包含关键字段（软件导出格式或立创商城格式）
    const hasSoftwareHeaders = cellTexts.some(text => 
      text === 'ID' || text === 'Name' || text === 'Category' || 
      text === 'Description' || text === 'Min Stock Level'
    );
    const hasLCSCHeaders = cellTexts.some(text => 
      text.includes('商品编号') || text.includes('型号') || text.includes('序号')
    );
    
    if (hasSoftwareHeaders || hasLCSCHeaders) {
      headerRowIndex = i;
      headers = cellTexts;
      console.log('找到表头行，索引:', i);
      console.log('表头:', headers);
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error('未找到表头行，请确保文件包含必需的字段');
  }

  // 检测字段位置
  // 检测字段位置
  const idIndex = detectFieldName(headers, FIELD_MAPPING.id);
  const nameIndex = detectFieldName(headers, FIELD_MAPPING.name);
  const descIndex = detectFieldName(headers, FIELD_MAPPING.description);
  const categoryIndex = detectFieldName(headers, FIELD_MAPPING.category);
  const qtyIndex = detectFieldName(headers, FIELD_MAPPING.quantity);
  const locationIndex = detectFieldName(headers, FIELD_MAPPING.location);
  const minStockIndex = detectFieldName(headers, FIELD_MAPPING.minStockLevel);
  
  // 立创商城特有字段
  const brandIndex = detectFieldName(headers, FIELD_MAPPING.brand);
  const packageIndex = detectFieldName(headers, FIELD_MAPPING.package);
  const attrIndex = detectFieldName(headers, FIELD_MAPPING.attributes);
  const modelIndex = detectFieldName(headers, FIELD_MAPPING.modelNumber);

  console.log('字段位置:', {
    idIndex,
    nameIndex,
    descIndex,
    categoryIndex,
    qtyIndex,
    locationIndex,
    minStockIndex,
    brandIndex,
    packageIndex,
    attrIndex,
    modelIndex
  });

  // 判断是软件导出格式还是立创商城格式
  const hasSoftwareFields = idIndex !== -1 && categoryIndex !== -1 && descIndex !== -1;
  const hasLCSCFields = brandIndex !== -1 || packageIndex !== -1 || modelIndex !== -1;
  const isSoftwareExport = hasSoftwareFields && !hasLCSCFields;
  
  console.log('格式判断:', { 
    isSoftwareExport, 
    hasSoftwareFields, 
    hasLCSCFields 
  });

  if (nameIndex === -1) {
    throw new Error('未找到名称字段');
  }
  
  if (qtyIndex === -1) {
    throw new Error('未找到数量字段');
  }

  // 解析数据行
  const components: ParsedComponent[] = [];
  
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || 
                  row.match(/<TD[^>]*>([\s\S]*?)<\/TD>/gi) || [];
    const values = cells.map(cell => {
      let text = cell.replace(/<[^>]+>/g, '');
      text = text.replace(/&nbsp;/g, ' ');
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&amp;/g, '&');
      return text.trim();
    });

    if (values.length === 0) continue;

    if (isSoftwareExport) {
      // 软件导出格式
      const id = idIndex !== -1 ? values[idIndex] : undefined;
      const name = values[nameIndex] || '';
      const description = descIndex !== -1 ? values[descIndex] : '';
      const category = categoryIndex !== -1 ? values[categoryIndex] : 'Other';
      const quantity = parseInt(values[qtyIndex]?.replace(/[^\d]/g, '') || '0') || 0;
      const location = locationIndex !== -1 ? values[locationIndex] : '';
      const minStockLevel = minStockIndex !== -1 ? parseInt(values[minStockIndex] || '10') : 10;
      
      if (!name) continue;
      
      // 尝试从描述中提取参数
      const specifications = description ? extractSpecifications(category, '', description, '') : undefined;
      
      const component: any = {
        name,
        description,
        category,
        quantity,
        location,
        minStockLevel,
        specifications
      };
      
      if (id) {
        component.id = id;
      }
      
      components.push(component);
      console.log('添加组件:', component);
    } else {
      // 立创商城格式
      const partNumber = values[nameIndex] || '';
      const brand = brandIndex !== -1 ? values[brandIndex] : '';
      const pkg = packageIndex !== -1 ? values[packageIndex] : '';
      const desc = descIndex !== -1 ? values[descIndex] : '';
      const attr = attrIndex !== -1 ? values[attrIndex] : '';
      const model = modelIndex !== -1 ? values[modelIndex] : '';
      const qtyStr = values[qtyIndex] || '0';
      
      console.log(`第 ${i} 行数据:`, { partNumber, brand, pkg, qtyStr });
      
      // 跳过空行或序号行（纯数字且小于100）
      if (!partNumber || (partNumber.match(/^\d+$/) && parseInt(partNumber) < 100)) continue;

      let fullDescription = model || attr || desc;
      if (brand && !fullDescription.includes(brand)) {
        fullDescription = brand + (fullDescription ? ' - ' + fullDescription : '');
      }
      if (pkg && !fullDescription.includes(pkg)) {
        fullDescription += (fullDescription ? ' | ' : '') + pkg;
      }
      if (desc && !fullDescription.includes(desc)) {
        fullDescription += (fullDescription ? ' | ' : '') + desc;
      }

      const quantity = parseInt(qtyStr.replace(/[^\d]/g, '')) || 0;
      if (quantity === 0) continue;

      const category = autoDetectCategory(partNumber, fullDescription);
      
      // 提取参数
      const specifications = extractSpecifications(category, pkg, fullDescription, model);

      components.push({
        name: partNumber,
        description: fullDescription || partNumber,
        category,
        quantity,
        location: '',
        minStockLevel: Math.max(Math.floor(quantity * 0.2), 5),
        specifications
      });
      
      console.log('添加组件:', components[components.length - 1]);
    }
  }

  console.log('解析完成，共', components.length, '个组件');

  if (components.length === 0) {
    throw new Error('未找到有效的组件数据，请检查文件格式');
  }

  return components;
}

// 解析 CSV 内容
export function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('文件内容不足');
  }

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  console.log('CSV 表头:', headers);
  
  // 检测字段位置
  const idIndex = detectFieldName(headers, FIELD_MAPPING.id);
  const nameIndex = detectFieldName(headers, FIELD_MAPPING.name);
  const descIndex = detectFieldName(headers, FIELD_MAPPING.description);
  const categoryIndex = detectFieldName(headers, FIELD_MAPPING.category);
  const qtyIndex = detectFieldName(headers, FIELD_MAPPING.quantity);
  const locationIndex = detectFieldName(headers, FIELD_MAPPING.location);
  const minStockIndex = detectFieldName(headers, FIELD_MAPPING.minStockLevel);
  const specsIndex = detectFieldName(headers, FIELD_MAPPING.specifications);
  
  // 立创商城特有字段
  const brandIndex = detectFieldName(headers, FIELD_MAPPING.brand);
  const packageIndex = detectFieldName(headers, FIELD_MAPPING.package);
  const attrIndex = detectFieldName(headers, FIELD_MAPPING.attributes);
  const modelIndex = detectFieldName(headers, FIELD_MAPPING.modelNumber);

  console.log('字段位置:', {
    idIndex,
    nameIndex,
    descIndex,
    categoryIndex,
    qtyIndex,
    locationIndex,
    minStockIndex,
    specsIndex,
    brandIndex,
    packageIndex,
    attrIndex,
    modelIndex
  });

  // 判断是软件导出格式还是立创商城格式
  // 软件导出格式的特征：有 ID、Category、Description 字段
  // 立创商城格式的特征：有 品牌、封装、厂家型号 字段
  const hasSoftwareFields = idIndex !== -1 && categoryIndex !== -1 && descIndex !== -1;
  const hasLCSCFields = brandIndex !== -1 || packageIndex !== -1 || modelIndex !== -1;
  
  // 优先判断：如果有 ID 和 Category，肯定是软件导出格式
  const isSoftwareExport = hasSoftwareFields && !hasLCSCFields;
  
  console.log('格式判断:', { 
    isSoftwareExport, 
    hasSoftwareFields, 
    hasLCSCFields 
  });
  
  if (!isSoftwareExport && nameIndex === -1) {
    throw new Error('未找到名称字段');
  }
  
  if (qtyIndex === -1) {
    throw new Error('未找到数量字段');
  }

  const components: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (isSoftwareExport) {
      // 软件导出格式：直接使用字段值
      const id = idIndex !== -1 ? values[idIndex]?.replace(/^"|"$/g, '').trim() : undefined;
      const name = values[nameIndex]?.replace(/^"|"$/g, '').trim() || '';
      const description = descIndex !== -1 ? values[descIndex]?.replace(/^"|"$/g, '').trim() : '';
      const category = categoryIndex !== -1 ? values[categoryIndex]?.replace(/^"|"$/g, '').trim() : 'Other';
      const quantity = parseInt(values[qtyIndex]?.replace(/[^\d]/g, '') || '0') || 0;
      const location = locationIndex !== -1 ? values[locationIndex]?.replace(/^"|"$/g, '').trim() : '';
      const minStockLevel = minStockIndex !== -1 ? parseInt(values[minStockIndex]?.replace(/[^\d]/g, '') || '10') : 10;
      
      // 解析 specifications 字段（如果存在）
      let specifications = undefined;
      if (specsIndex !== -1 && values[specsIndex]) {
        const specsStr = values[specsIndex]?.replace(/^"|"$/g, '').trim();
        if (specsStr && specsStr !== '{}' && specsStr !== '') {
          try {
            specifications = JSON.parse(specsStr);
            console.log('从 CSV 解析 specifications:', specifications);
          } catch (e) {
            console.warn('无法解析 specifications JSON:', specsStr);
            // 如果解析失败，尝试从描述中提取
            specifications = description ? extractSpecifications(category, '', description, '') : undefined;
          }
        }
      }
      
      // 如果没有 specifications 字段或解析失败，尝试从描述中提取
      if (!specifications && description) {
        specifications = extractSpecifications(category, '', description, '');
      }
      
      console.log(`第 ${i} 行数据:`, { id, name, category, quantity, specifications });
      
      if (!name) continue;
      
      const component: any = {
        name,
        description,
        category,
        quantity,
        location,
        minStockLevel,
        specifications
      };
      
      // 如果有 ID，添加到组件对象中
      if (id) {
        component.id = id;
      }
      
      components.push(component);
      console.log('添加组件:', component);
    } else {
      // 立创商城格式：需要构建描述和自动分类
      const partNumber = values[nameIndex]?.replace(/^"|"$/g, '').trim() || '';
      const brand = brandIndex !== -1 ? values[brandIndex]?.replace(/^"|"$/g, '').trim() : '';
      const pkg = packageIndex !== -1 ? values[packageIndex]?.replace(/^"|"$/g, '').trim() : '';
      const desc = descIndex !== -1 ? values[descIndex]?.replace(/^"|"$/g, '').trim() : '';
      const attr = attrIndex !== -1 ? values[attrIndex]?.replace(/^"|"$/g, '').trim() : '';
      const model = modelIndex !== -1 ? values[modelIndex]?.replace(/^"|"$/g, '').trim() : '';
      const qtyStr = values[qtyIndex]?.replace(/^"|"$/g, '').trim() || '0';
      
      if (!partNumber || partNumber.match(/^\d+$/)) continue;

      let fullDescription = model || attr || desc;
      if (brand && !fullDescription.includes(brand)) {
        fullDescription = brand + (fullDescription ? ' - ' + fullDescription : '');
      }
      if (pkg && !fullDescription.includes(pkg)) {
        fullDescription += (fullDescription ? ' | ' : '') + pkg;
      }

      const quantity = parseInt(qtyStr.replace(/[^\d]/g, '')) || 0;
      if (quantity === 0) continue;

      const category = autoDetectCategory(partNumber, fullDescription);
      
      // 提取参数
      const specifications = extractSpecifications(category, pkg, fullDescription, model);

      components.push({
        name: partNumber,
        description: fullDescription || partNumber,
        category,
        quantity,
        location: '',
        minStockLevel: Math.max(Math.floor(quantity * 0.2), 5),
        specifications
      });
    }
  }

  return components;
}

