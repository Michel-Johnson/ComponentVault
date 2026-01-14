# 导出功能快速指南

## 🚀 快速开始

### Settings 页面导出

1. **进入 Settings 页面**
   - 点击顶部导航栏的 "Settings"

2. **选择导出格式**
   - 找到 "Data Management" 部分
   - 在 "Export Format" 下拉菜单中选择：
     - **JSON** - 完整备份（推荐用于备份）
     - **CSV** - 电子表格格式（推荐用于分析）
     - **Excel** - Excel 格式（推荐用于报表）

3. **导出数据**
   - 点击 "Export Data" 按钮
   - 文件自动下载到浏览器下载文件夹

---

### Reports 页面导出

1. **进入 Reports 页面**
   - 点击顶部导航栏的 "Reports"

2. **选择时间范围**（可选）
   - 最近 7 天
   - 最近 30 天
   - 最近 90 天
   - 最近一年

3. **选择导出格式**
   - 在时间范围旁边的下拉菜单中选择：
     - **JSON** - 包含统计数据
     - **CSV** - 简洁的表格
     - **Excel** - 带统计摘要的报表

4. **导出报表**
   - 点击 "Export Report" 按钮
   - 文件自动下载

---

## 📋 格式选择建议

### 什么时候用 JSON？
- ✅ 定期备份数据
- ✅ 需要恢复数据
- ✅ 迁移到新系统
- ✅ 保存完整设置

### 什么时候用 CSV？
- ✅ 在 Excel 中分析数据
- ✅ 与他人共享数据
- ✅ 制作自定义图表
- ✅ 导入到其他系统

### 什么时候用 Excel？
- ✅ 制作专业报表
- ✅ 打印输出
- ✅ 向管理层汇报
- ✅ 需要格式化表格

---

## 🎯 常见使用场景

### 场景 1：每周备份
```
Settings → JSON → Export Data → 保存到云盘
```

### 场景 2：月度分析
```
Reports → 选择时间范围 → CSV → Export Report → Excel 打开分析
```

### 场景 3：管理汇报
```
Reports → 选择时间范围 → Excel → Export Report → 打印或发送
```

### 场景 4：数据共享
```
Settings → CSV → Export Data → 发送给同事
```

---

## 💡 提示

1. **JSON 格式**
   - 只有 JSON 可以导入回系统
   - 包含所有设置和数据
   - 文件名：`inventory-backup-YYYY-MM-DD.json`

2. **CSV 格式**
   - 可以用 Excel、Google Sheets、Numbers 打开
   - 纯文本，文件小
   - 文件名：`inventory-export-YYYY-MM-DD.csv`

3. **Excel 格式**
   - 带格式化表格和绿色表头
   - 适合直接打印
   - 文件名：`inventory-export-YYYY-MM-DD.xls`

4. **文件位置**
   - 所有文件下载到浏览器默认下载文件夹
   - 通常是 `~/Downloads` 或 `C:\Users\用户名\Downloads`

5. **文件命名**
   - 文件名自动包含日期
   - 格式：`inventory-xxx-2024-01-14.格式`
   - 下载后可以重命名

---

## ⚠️ 注意事项

1. **只有 JSON 可以导入**
   - CSV 和 Excel 只能查看和分析
   - 不能导入回系统

2. **定期备份**
   - 建议每周用 JSON 格式备份一次
   - 保存到安全位置（云盘、外部硬盘）

3. **文件大小**
   - JSON：中等大小
   - CSV：最小
   - Excel：最大

4. **数据完整性**
   - JSON：包含所有数据和设置
   - CSV/Excel：只包含组件数据

---

## 🎉 开始使用

现在就试试吧！
1. 进入 Settings 或 Reports 页面
2. 选择你需要的格式
3. 点击导出按钮
4. 查看下载的文件

简单、快速、灵活！
