import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const components = pgTable("components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  location: text("location").notNull(),
  description: text("description").notNull(),
  minStockLevel: integer("min_stock_level").notNull().default(10),
  specifications: jsonb("specifications"),  // 新增：存储特定参数
});

// 电容参数
export const capacitorSpecsSchema = z.object({
  package: z.string().optional(),      // 封装 (如 0603, 0805)
  capacitance: z.string().optional(),  // 容值 (如 10nF, 100uF)
  tolerance: z.string().optional(),    // 误差 (如 ±10%, ±20%)
  voltage: z.string().optional(),      // 耐压 (如 50V, 16V)
});

// 电阻参数
export const resistorSpecsSchema = z.object({
  package: z.string().optional(),      // 封装
  resistance: z.string().optional(),   // 阻值 (如 10kΩ, 1MΩ)
  tolerance: z.string().optional(),    // 误差
  power: z.string().optional(),        // 功率 (如 1/4W, 1/8W)
});

// 集成电路参数
export const icSpecsSchema = z.object({
  package: z.string().optional(),      // 封装 (如 DIP-8, SOIC-16)
  model: z.string().optional(),        // 型号
  voltage: z.string().optional(),      // 工作电压
});

// 晶体管参数
export const transistorSpecsSchema = z.object({
  package: z.string().optional(),      // 封装
  type: z.string().optional(),         // 类型 (如 NPN, PNP, N-Channel)
  voltage: z.string().optional(),      // 耐压
  current: z.string().optional(),      // 电流
});

// 二极管参数
export const diodeSpecsSchema = z.object({
  package: z.string().optional(),      // 封装
  type: z.string().optional(),         // 类型 (如 Schottky, Zener, LED)
  voltage: z.string().optional(),      // 电压
  current: z.string().optional(),      // 电流
});

// 连接器参数
export const connectorSpecsSchema = z.object({
  type: z.string().optional(),         // 类型 (如 USB, Type-C, Header)
  pins: z.string().optional(),         // 引脚数
  pitch: z.string().optional(),        // 间距
  current: z.string().optional(),      // 额定电流
});

// 电感参数
export const inductorSpecsSchema = z.object({
  package: z.string().optional(),      // 封装
  inductance: z.string().optional(),   // 电感值 (如 10uH, 100nH)
  tolerance: z.string().optional(),    // 误差
  current: z.string().optional(),      // 额定电流
});

// 传感器参数
export const sensorSpecsSchema = z.object({
  type: z.string().optional(),         // 类型 (如 Temperature, Humidity)
  range: z.string().optional(),        // 测量范围
  accuracy: z.string().optional(),     // 精度
  interface: z.string().optional(),    // 接口 (如 I2C, SPI)
});

// 通用参数（用于其他类别）
export const genericSpecsSchema = z.object({
  package: z.string().optional(),
  model: z.string().optional(),
});

export const insertComponentSchema = createInsertSchema(components).omit({
  id: true,
}).extend({
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
  minStockLevel: z.number().int().min(0, "Minimum stock level must be 0 or greater"),
  specifications: z.any().optional(),
});

export const updateComponentSchema = insertComponentSchema.partial();

export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type UpdateComponent = z.infer<typeof updateComponentSchema>;
export type Component = typeof components.$inferSelect;

export const COMPONENT_CATEGORIES = [
  "Resistors",
  "Capacitors", 
  "Integrated Circuits",
  "Transistors",
  "Diodes",
  "Connectors",
  "Inductors",
  "Switches",
  "Sensors",
  "Other"
] as const;

export type ComponentCategory = typeof COMPONENT_CATEGORIES[number];

// 类别参数字段定义
export const CATEGORY_SPEC_FIELDS = {
  "Capacitors": [
    { key: "package", label: "Package", labelZh: "封装", placeholder: "0603, 0805, etc." },
    { key: "capacitance", label: "Capacitance", labelZh: "容值", placeholder: "10nF, 100uF, etc." },
    { key: "tolerance", label: "Tolerance", labelZh: "误差", placeholder: "±10%, ±20%, etc." },
    { key: "voltage", label: "Voltage Rating", labelZh: "耐压", placeholder: "50V, 16V, etc." },
  ],
  "Resistors": [
    { key: "package", label: "Package", labelZh: "封装", placeholder: "0603, 0805, etc." },
    { key: "resistance", label: "Resistance", labelZh: "阻值", placeholder: "10kΩ, 1MΩ, etc." },
    { key: "tolerance", label: "Tolerance", labelZh: "误差", placeholder: "±1%, ±5%, etc." },
    { key: "power", label: "Power Rating", labelZh: "功率", placeholder: "1/4W, 1/8W, etc." },
  ],
  "Integrated Circuits": [
    { key: "package", label: "Package", labelZh: "封装", placeholder: "DIP-8, SOIC-16, etc." },
    { key: "model", label: "Model Number", labelZh: "型号", placeholder: "ATmega328P, etc." },
    { key: "voltage", label: "Operating Voltage", labelZh: "工作电压", placeholder: "3.3V, 5V, etc." },
  ],
  "Transistors": [
    { key: "package", label: "Package", labelZh: "封装", placeholder: "SOT-23, TO-220, etc." },
    { key: "type", label: "Type", labelZh: "类型", placeholder: "NPN, PNP, N-Channel, etc." },
    { key: "voltage", label: "Voltage Rating", labelZh: "耐压", placeholder: "60V, 100V, etc." },
    { key: "current", label: "Current Rating", labelZh: "电流", placeholder: "1A, 2A, etc." },
  ],
  "Diodes": [
    { key: "package", label: "Package", labelZh: "封装", placeholder: "SOD-123, DO-214, etc." },
    { key: "type", label: "Type", labelZh: "类型", placeholder: "Schottky, Zener, LED, etc." },
    { key: "voltage", label: "Voltage", labelZh: "电压", placeholder: "30V, 5.1V, etc." },
    { key: "current", label: "Current", labelZh: "电流", placeholder: "1A, 500mA, etc." },
  ],
  "Connectors": [
    { key: "type", label: "Type", labelZh: "类型", placeholder: "USB, Type-C, Header, etc." },
    { key: "pins", label: "Pin Count", labelZh: "引脚数", placeholder: "4, 8, 24, etc." },
    { key: "pitch", label: "Pitch", labelZh: "间距", placeholder: "2.54mm, 1.27mm, etc." },
    { key: "current", label: "Current Rating", labelZh: "额定电流", placeholder: "1A, 3A, etc." },
  ],
  "Inductors": [
    { key: "package", label: "Package", labelZh: "封装", placeholder: "0603, 0805, etc." },
    { key: "inductance", label: "Inductance", labelZh: "电感值", placeholder: "10uH, 100nH, etc." },
    { key: "tolerance", label: "Tolerance", labelZh: "误差", placeholder: "±10%, ±20%, etc." },
    { key: "current", label: "Current Rating", labelZh: "额定电流", placeholder: "1A, 500mA, etc." },
  ],
  "Sensors": [
    { key: "type", label: "Sensor Type", labelZh: "传感器类型", placeholder: "Temperature, Humidity, etc." },
    { key: "range", label: "Measurement Range", labelZh: "测量范围", placeholder: "-40~125°C, etc." },
    { key: "accuracy", label: "Accuracy", labelZh: "精度", placeholder: "±0.5°C, etc." },
    { key: "interface", label: "Interface", labelZh: "接口", placeholder: "I2C, SPI, Analog, etc." },
  ],
  "Switches": [
    { key: "type", label: "Type", labelZh: "类型", placeholder: "Tactile, Toggle, etc." },
    { key: "voltage", label: "Voltage Rating", labelZh: "额定电压", placeholder: "12V, 24V, etc." },
    { key: "current", label: "Current Rating", labelZh: "额定电流", placeholder: "50mA, 100mA, etc." },
  ],
  "Other": [
    { key: "package", label: "Package", labelZh: "封装", placeholder: "" },
    { key: "model", label: "Model", labelZh: "型号", placeholder: "" },
  ],
} as const;
