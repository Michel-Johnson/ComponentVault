import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    "app.name": "ElectroVault",
    "nav.inventory": "Inventory",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    
    // Inventory Page
    "inventory.title": "Inventory",
    "inventory.search": "Search components...",
    "inventory.allCategories": "All Categories",
    "inventory.addComponent": "Add Component",
    "inventory.lowStockAlert": "Low Stock Alert",
    "inventory.lowStockMessage": "components are running low on stock",
    
    // Stats
    "stats.totalComponents": "Total Components",
    "stats.lowStockItems": "Low Stock Items",
    "stats.categories": "Categories",
    "stats.totalQuantity": "Total Quantity",
    
    // Table
    "table.component": "COMPONENT",
    "table.category": "CATEGORY",
    "table.quantity": "QUANTITY",
    "table.location": "LOCATION",
    "table.specifications": "SPECIFICATIONS",
    "table.status": "STATUS",
    "table.actions": "ACTIONS",
    "table.inStock": "In Stock",
    "table.lowStock": "Low Stock",
    "table.outOfStock": "Out of Stock",
    "table.noComponents": "No components found",
    "table.loading": "Loading...",
    
    // Reports Page
    "reports.title": "Reports & Analytics",
    "reports.subtitle": "Inventory insights and statistics",
    "reports.last7days": "Last 7 days",
    "reports.last30days": "Last 30 days",
    "reports.last90days": "Last 90 days",
    "reports.lastYear": "Last year",
    "reports.exportReport": "Export Report",
    "reports.totalInventoryValue": "Total Inventory Value",
    "reports.units": "units",
    "reports.across": "Across",
    "reports.componentTypes": "component types",
    "reports.stockHealth": "Stock Health",
    "reports.adequateStock": "Components with adequate stock",
    "reports.lowStockItems": "Low Stock Items",
    "reports.requireAttention": "Require immediate attention",
    "reports.categoryDistribution": "Category Distribution",
    "reports.types": "types",
    "reports.topStocked": "Top Stocked Items",
    "reports.lowStocked": "Low Stocked Items",
    
    // Settings Page
    "settings.title": "Settings",
    "settings.subtitle": "Manage your application preferences",
    "settings.notifications": "Notifications",
    "settings.notificationsDesc": "Configure how you receive alerts and notifications",
    "settings.lowStockAlerts": "Low Stock Alerts",
    "settings.lowStockAlertsDesc": "Show alerts when components are running low",
    "settings.lowStockThreshold": "Low Stock Threshold",
    "settings.thresholdDesc": "Alert when quantity falls below this number",
    "settings.display": "Display",
    "settings.displayDesc": "Customize the appearance and layout",
    "settings.theme": "Theme",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.itemsPerPage": "Items Per Page",
    "settings.dataManagement": "Data Management",
    "settings.dataManagementDesc": "Backup, restore, and manage your inventory data",
    "settings.autoBackup": "Automatic Backups",
    "settings.autoBackupDesc": "Automatically backup your data regularly",
    "settings.backupFrequency": "Backup Frequency",
    "settings.hourly": "Hourly",
    "settings.daily": "Daily",
    "settings.weekly": "Weekly",
    "settings.monthly": "Monthly",
    "settings.dataRetention": "Data Retention Period",
    "settings.30days": "30 days",
    "settings.90days": "90 days",
    "settings.180days": "180 days",
    "settings.1year": "1 year",
    "settings.unlimited": "Unlimited",
    "settings.dataOperations": "Data Operations",
    "settings.exportFormat": "Export Format",
    "settings.jsonDesc": "Complete backup with settings",
    "settings.csvDesc": "Spreadsheet compatible",
    "settings.excelDesc": "Microsoft Excel format",
    "settings.exportData": "Export Data",
    "settings.importData": "Import Data",
    "settings.clearData": "Clear All Data",
    "settings.cancel": "Cancel",
    "settings.saveSettings": "Save Settings",
    "settings.language": "Language",
    "settings.languageDesc": "Choose your preferred language",
    "settings.settingsSaved": "Settings saved",
    "settings.settingsSavedDesc": "Your preferences have been updated successfully.",
    "settings.exportStarted": "Export started",
    "settings.exportSuccess": "Data exported successfully!",
    "settings.exportFailed": "Export failed",
    "settings.exportFailedDesc": "Failed to export data. Please try again.",
    "settings.importStarted": "Import started",
    "settings.importSuccess": "Data imported successfully! Reloading...",
    "settings.imported": "imported",
    "settings.failed": "failed",
    "settings.importFailed": "Import failed",
    "settings.importFailedDesc": "Failed to import data. Please check the file format.",
    "settings.dataCleared": "Data cleared",
    "settings.dataClearedDesc": "All inventory data has been removed.",
    "settings.clearFailed": "Clear failed",
    "settings.clearFailedDesc": "Failed to clear data. Please try again.",
    "settings.confirmClear": "Are you sure you want to clear all data? This action cannot be undone.",
    
    // Categories
    "category.Integrated Circuits": "Integrated Circuits",
    "category.Resistors": "Resistors",
    "category.Capacitors": "Capacitors",
    "category.Transistors": "Transistors",
    "category.Diodes": "Diodes",
    "category.Connectors": "Connectors",
    "category.Inductors": "Inductors",
    "category.Switches": "Switches",
    "category.Sensors": "Sensors",
    "category.Other": "Other",
    
    // Specification Fields
    "spec.package": "Package",
    "spec.capacitance": "Capacitance",
    "spec.tolerance": "Tolerance",
    "spec.voltage": "Voltage",
    "spec.resistance": "Resistance",
    "spec.power": "Power",
    "spec.type": "Type",
    "spec.current": "Current",
    "spec.inductance": "Inductance",
    "spec.frequency": "Frequency",
    "spec.pins": "Pins",
    "spec.color": "Color",
  },
  zh: {
    // Header
    "app.name": "电子元件库",
    "nav.inventory": "库存",
    "nav.reports": "报表",
    "nav.settings": "设置",
    
    // Inventory Page
    "inventory.title": "库存管理",
    "inventory.search": "搜索元件...",
    "inventory.allCategories": "所有类别",
    "inventory.addComponent": "添加元件",
    "inventory.lowStockAlert": "低库存警报",
    "inventory.lowStockMessage": "个元件库存不足",
    
    // Stats
    "stats.totalComponents": "元件总数",
    "stats.lowStockItems": "低库存项目",
    "stats.categories": "类别数量",
    "stats.totalQuantity": "总数量",
    
    // Table
    "table.component": "元件",
    "table.category": "类别",
    "table.quantity": "数量",
    "table.location": "位置",
    "table.specifications": "参数",
    "table.status": "状态",
    "table.actions": "操作",
    "table.inStock": "有货",
    "table.lowStock": "库存不足",
    "table.outOfStock": "缺货",
    "table.noComponents": "未找到元件",
    "table.loading": "加载中...",
    
    // Reports Page
    "reports.title": "报表与分析",
    "reports.subtitle": "库存洞察与统计",
    "reports.last7days": "最近 7 天",
    "reports.last30days": "最近 30 天",
    "reports.last90days": "最近 90 天",
    "reports.lastYear": "最近一年",
    "reports.exportReport": "导出报表",
    "reports.totalInventoryValue": "总库存价值",
    "reports.units": "件",
    "reports.across": "共",
    "reports.componentTypes": "种元件类型",
    "reports.stockHealth": "库存健康度",
    "reports.adequateStock": "库存充足的元件",
    "reports.lowStockItems": "低库存项目",
    "reports.requireAttention": "需要立即关注",
    "reports.categoryDistribution": "类别分布",
    "reports.types": "种",
    "reports.topStocked": "库存最多的项目",
    "reports.lowStocked": "库存最少的项目",
    
    // Settings Page
    "settings.title": "设置",
    "settings.subtitle": "管理您的应用偏好",
    "settings.notifications": "通知",
    "settings.notificationsDesc": "配置您接收警报和通知的方式",
    "settings.lowStockAlerts": "低库存警报",
    "settings.lowStockAlertsDesc": "当元件库存不足时显示警报",
    "settings.lowStockThreshold": "低库存阈值",
    "settings.thresholdDesc": "当数量低于此值时发出警报",
    "settings.display": "显示",
    "settings.displayDesc": "自定义外观和布局",
    "settings.theme": "主题",
    "settings.light": "浅色",
    "settings.dark": "深色",
    "settings.system": "跟随系统",
    "settings.itemsPerPage": "每页显示数量",
    "settings.dataManagement": "数据管理",
    "settings.dataManagementDesc": "备份、恢复和管理您的库存数据",
    "settings.autoBackup": "自动备份",
    "settings.autoBackupDesc": "定期自动备份您的数据",
    "settings.backupFrequency": "备份频率",
    "settings.hourly": "每小时",
    "settings.daily": "每天",
    "settings.weekly": "每周",
    "settings.monthly": "每月",
    "settings.dataRetention": "数据保留期限",
    "settings.30days": "30 天",
    "settings.90days": "90 天",
    "settings.180days": "180 天",
    "settings.1year": "1 年",
    "settings.unlimited": "无限制",
    "settings.dataOperations": "数据操作",
    "settings.exportFormat": "导出格式",
    "settings.jsonDesc": "完整备份（含设置）",
    "settings.csvDesc": "电子表格兼容",
    "settings.excelDesc": "Microsoft Excel 格式",
    "settings.exportData": "导出数据",
    "settings.importData": "导入数据",
    "settings.clearData": "清除所有数据",
    "settings.language": "语言",
    "settings.languageDesc": "选择您的首选语言",
    "settings.cancel": "取消",
    "settings.saveSettings": "保存设置",
    "settings.settingsSaved": "设置已保存",
    "settings.settingsSavedDesc": "您的偏好设置已成功更新。",
    "settings.exportStarted": "导出已开始",
    "settings.exportSuccess": "数据导出成功！",
    "settings.exportFailed": "导出失败",
    "settings.exportFailedDesc": "导出数据失败，请重试。",
    "settings.importStarted": "导入已开始",
    "settings.importSuccess": "数据导入成功！正在重新加载...",
    "settings.imported": "已导入",
    "settings.failed": "失败",
    "settings.importFailed": "导入失败",
    "settings.importFailedDesc": "导入数据失败，请检查文件格式。",
    "settings.dataCleared": "数据已清除",
    "settings.dataClearedDesc": "所有库存数据已被删除。",
    "settings.clearFailed": "清除失败",
    "settings.clearFailedDesc": "清除数据失败，请重试。",
    "settings.confirmClear": "您确定要清除所有数据吗？此操作无法撤销。",
    
    // Categories
    "category.Integrated Circuits": "集成电路",
    "category.Resistors": "电阻",
    "category.Capacitors": "电容",
    "category.Transistors": "晶体管",
    "category.Diodes": "二极管",
    "category.Connectors": "连接器",
    "category.Inductors": "电感",
    "category.Switches": "开关",
    "category.Sensors": "传感器",
    "category.Other": "其他",
    
    // Specification Fields
    "spec.package": "封装",
    "spec.capacitance": "容值",
    "spec.tolerance": "精度",
    "spec.voltage": "电压",
    "spec.resistance": "阻值",
    "spec.power": "功率",
    "spec.type": "类型",
    "spec.current": "电流",
    "spec.inductance": "感值",
    "spec.frequency": "频率",
    "spec.pins": "引脚数",
    "spec.color": "颜色",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored as Language) || "en";
  });

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations.en];
    if (translation) return translation;
    
    // 如果找不到翻译，尝试移除前缀并返回原始值
    if (key.startsWith('category.')) {
      const categoryName = key.replace('category.', '');
      // 如果是中文模式，尝试查找对应的翻译
      if (language === 'zh') {
        const zhTranslations: Record<string, string> = {
          'Integrated Circuits': '集成电路',
          'Resistors': '电阻',
          'Capacitors': '电容',
          'Transistors': '晶体管',
          'Diodes': '二极管',
          'Connectors': '连接器',
          'Inductors': '电感',
          'Switches': '开关',
          'Sensors': '传感器',
          'Other': '其他'
        };
        return zhTranslations[categoryName] || categoryName;
      }
      return categoryName;
    }
    
    if (key.startsWith('spec.')) {
      const specName = key.replace('spec.', '');
      // 如果是中文模式，尝试查找对应的翻译
      if (language === 'zh') {
        const zhTranslations: Record<string, string> = {
          'package': '封装',
          'capacitance': '容值',
          'tolerance': '精度',
          'voltage': '电压',
          'resistance': '阻值',
          'power': '功率',
          'type': '类型',
          'current': '电流',
          'inductance': '感值',
          'frequency': '频率',
          'pins': '引脚数',
          'color': '颜色'
        };
        return zhTranslations[specName] || specName;
      }
      return specName;
    }
    
    return key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
