import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Database, 
  Palette, 
  Download,
  Upload,
  Trash2,
  Languages
} from "lucide-react";

// 合并完全相同的元件（除了数量）
function mergeComponents(components: any[]): any[] {
  const merged = new Map<string, any>();
  
  for (const component of components) {
    // 创建唯一键：包含所有字段（除了数量和ID）
    const specsKey = component.specifications ? JSON.stringify(component.specifications) : '';
    const key = `${component.name}|${component.category}|${component.description || ''}|${component.location || ''}|${component.minStockLevel || 0}|${specsKey}`;
    
    console.log(`检查元件: ${component.name}, 键: ${key.substring(0, 100)}...`);
    
    if (merged.has(key)) {
      // 如果已存在，累加数量
      const existing = merged.get(key);
      const oldQty = existing.quantity;
      existing.quantity += component.quantity;
      console.log(`✓ 合并元件: ${component.name}, 新数量: ${existing.quantity} (${oldQty} + ${component.quantity})`);
    } else {
      // 新元件，添加到 Map
      merged.set(key, { ...component });
      console.log(`  新元件: ${component.name}, 数量: ${component.quantity}`);
    }
  }
  
  console.log(`合并完成: 原始 ${components.length} 个 -> 合并后 ${merged.size} 个`);
  return Array.from(merged.values());
}

type ExportFormat = "json";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const [settings, setSettings] = useState({
    // Notification Settings
    lowStockAlerts: true,
    lowStockThreshold: 10,
    
    // Display Settings
    itemsPerPage: 10,
    
    // System Settings
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: "365",
  });

  useEffect(() => {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast({
      title: t("settings.settingsSaved"),
      description: t("settings.settingsSavedDesc"),
    });
  };

  const handleExportData = async () => {
    try {
      // Fetch all components data
      const response = await fetch('/api/components');
      if (!response.ok) throw new Error('Failed to fetch components');
      const components = await response.json();
      
      const timestamp = new Date().toISOString().split('T')[0];
      exportAsJSON(components, timestamp);
      
      toast({
        title: t("settings.exportStarted"),
        description: t("settings.exportSuccess"),
      });
    } catch (error) {
      toast({
        title: t("settings.exportFailed"),
        description: t("settings.exportFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const exportAsJSON = (components: any[], timestamp: string) => {
    const exportData = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      components: components,
      settings: settings
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    downloadFile(blob, `inventory-backup-${timestamp}.json`);
  };

  const exportAsCSV = (components: any[], timestamp: string) => {
    // CSV header
    const headers = ['ID', 'Name', 'Description', 'Category', 'Quantity', 'Location', 'Min Stock Level', 'Specifications'];
    
    // CSV rows
    const rows = components.map(comp => [
      comp.id,
      `"${comp.name || ''}"`,
      `"${comp.description || ''}"`,
      `"${comp.category || ''}"`,
      comp.quantity || 0,
      `"${comp.location || ''}"`,
      comp.minStockLevel || 0,
      `"${comp.specifications ? JSON.stringify(comp.specifications) : ''}"`
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `inventory-export-${timestamp}.csv`);
  };

  const exportAsExcel = (components: any[], timestamp: string) => {
    // Create HTML table for Excel
    const headers = ['ID', 'Name', 'Description', 'Category', 'Quantity', 'Location', 'Min Stock Level', 'Specifications'];
    
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"><style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #4CAF50; color: white; }</style></head>';
    html += '<body><table>';
    
    // Header row
    html += '<tr>';
    headers.forEach(header => {
      html += `<th>${header}</th>`;
    });
    html += '</tr>';
    
    // Data rows
    components.forEach(comp => {
      html += '<tr>';
      html += `<td>${comp.id || ''}</td>`;
      html += `<td>${comp.name || ''}</td>`;
      html += `<td>${comp.description || ''}</td>`;
      html += `<td>${comp.category || ''}</td>`;
      html += `<td>${comp.quantity || 0}</td>`;
      html += `<td>${comp.location || ''}</td>`;
      html += `<td>${comp.minStockLevel || 0}</td>`;
      html += `<td>${comp.specifications ? JSON.stringify(comp.specifications) : ''}</td>`;
      html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    downloadFile(blob, `inventory-export-${timestamp}.xls`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv,.xls,.xlsx';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const fileName = file.name.toLowerCase();
        let components: any[] = [];
        
        // 根据文件类型解析
        if (fileName.endsWith('.json')) {
          // JSON 格式导入
          const text = await file.text();
          const importData = JSON.parse(text);
          
          if (!importData.components || !Array.isArray(importData.components)) {
            throw new Error('Invalid JSON format');
          }
          
          components = importData.components;
          
          // 导入设置
          if (importData.settings) {
            setSettings(importData.settings);
            localStorage.setItem('appSettings', JSON.stringify(importData.settings));
          }
        } else if (fileName.endsWith('.csv')) {
          // CSV 格式导入（立创商城格式）
          const text = await file.text();
          const { parseCSV } = await import('@/utils/import-parser');
          components = parseCSV(text);
        } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
          // Excel 格式导入（立创商城格式）
          // 读取为 ArrayBuffer 以支持二进制 Excel 文件
          const arrayBuffer = await file.arrayBuffer();
          
          // 尝试作为二进制 Excel 文件解析
          try {
            const { parseExcelBinary } = await import('@/utils/import-parser');
            components = parseExcelBinary(arrayBuffer);
          } catch (binaryError: any) {
            console.log('二进制解析失败，尝试 HTML 格式:', binaryError.message);
            
            // 如果二进制解析失败，尝试作为 HTML 格式
            const text = await file.text();
            const { parseExcelHTML } = await import('@/utils/import-parser');
            components = parseExcelHTML(text);
          }
        } else {
          throw new Error('Unsupported file format');
        }
        
        if (components.length === 0) {
          throw new Error('No components found in file');
        }
        
        // 自动合并完全相同的元件（除了数量）
        const mergedComponents = mergeComponents(components);
        console.log('合并后元件数量:', mergedComponents.length, '(原始:', components.length, ')');
        
        // 导入组件
        let successCount = 0;
        let errorCount = 0;
        
        console.log('开始导入组件，总数:', mergedComponents.length);
        
        for (const component of mergedComponents) {
          try {
            console.log('导入组件:', component.name, '(ID:', component.id || '无', ')');
            
            // 如果组件有 ID，尝试检查是否已存在
            if (component.id) {
              const checkResponse = await fetch(`/api/components/${component.id}`);
              
              if (checkResponse.ok) {
                // 组件已存在，更新它
                console.log('组件已存在，更新:', component.id);
                const response = await fetch(`/api/components/${component.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(component)
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  console.error('更新失败:', response.status, errorText);
                  throw new Error(`Update failed: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('更新成功:', result);
                successCount++;
                continue;
              }
            }
            
            // 组件不存在或没有 ID，创建新组件
            // 移除 id 字段，让数据库自动生成
            const { id, ...componentData } = component;
            console.log('创建新组件:', componentData.name);
            
            const response = await fetch('/api/components', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(componentData)
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('API 错误:', response.status, errorText);
              throw new Error(`API error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('创建成功:', result);
            successCount++;
          } catch (err) {
            errorCount++;
            console.error('导入组件失败:', component.name, err);
          }
        }
        
        console.log('导入完成，成功:', successCount, '失败:', errorCount);
        
        toast({
          title: t("settings.importStarted"),
          description: `${t("settings.importSuccess")} (${successCount} ${t("settings.imported")}, ${errorCount} ${t("settings.failed")})`,
        });
        
        // 刷新页面
        setTimeout(() => window.location.reload(), 1500);
      } catch (error: any) {
        console.error('Import error:', error);
        toast({
          title: t("settings.importFailed"),
          description: error.message || t("settings.importFailedDesc"),
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (!confirm(t("settings.confirmClear"))) return;
    
    try {
      // Fetch all components
      const response = await fetch('/api/components');
      if (!response.ok) throw new Error('Failed to fetch components');
      const components = await response.json();
      
      // Delete all components
      for (const component of components) {
        await fetch(`/api/components/${component.id}`, {
          method: 'DELETE'
        });
      }
      
      toast({
        title: t("settings.dataCleared"),
        description: t("settings.dataClearedDesc"),
        variant: "destructive",
      });
      
      // Reload page
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast({
        title: t("settings.clearFailed"),
        description: t("settings.clearFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const handleMergeDuplicates = async () => {
    try {
      // 获取所有元件
      const response = await fetch('/api/components');
      if (!response.ok) throw new Error('Failed to fetch components');
      const components = await response.json();
      
      console.log('开始合并重复元件，总数:', components.length);
      
      // 按所有字段分组（除了数量和ID）
      const groups = new Map<string, any[]>();
      
      for (const component of components) {
        const specsKey = component.specifications ? JSON.stringify(component.specifications) : '';
        const key = `${component.name}|${component.category}|${component.description || ''}|${component.location || ''}|${component.minStockLevel || 0}|${specsKey}`;
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(component);
      }
      
      // 找出重复的组
      let mergedCount = 0;
      let deletedCount = 0;
      
      for (const [key, group] of groups.entries()) {
        if (group.length > 1) {
          console.log(`发现重复元件组: ${group[0].name}, 数量: ${group.length}`);
          
          // 保留第一个，累加数量
          const primary = group[0];
          let totalQuantity = 0;
          
          for (const component of group) {
            totalQuantity += component.quantity;
          }
          
          // 更新第一个元件的数量
          await fetch(`/api/components/${primary.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: totalQuantity })
          });
          
          console.log(`✓ 更新 ${primary.name} 数量为 ${totalQuantity}`);
          
          // 删除其他重复的
          for (let i = 1; i < group.length; i++) {
            await fetch(`/api/components/${group[i].id}`, {
              method: 'DELETE'
            });
            deletedCount++;
            console.log(`  删除重复: ${group[i].id}`);
          }
          
          mergedCount++;
        }
      }
      
      if (mergedCount > 0) {
        toast({
          title: language === 'zh' ? '合并完成' : 'Merge Complete',
          description: language === 'zh' 
            ? `成功合并 ${mergedCount} 组重复元件，删除了 ${deletedCount} 个重复项`
            : `Merged ${mergedCount} duplicate groups, removed ${deletedCount} duplicates`,
        });
        
        // 刷新页面
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast({
          title: language === 'zh' ? '无需合并' : 'No Duplicates',
          description: language === 'zh' ? '未发现重复的元件' : 'No duplicate components found',
        });
      }
    } catch (error) {
      console.error('合并失败:', error);
      toast({
        title: language === 'zh' ? '合并失败' : 'Merge Failed',
        description: language === 'zh' ? '合并重复元件时出错' : 'Failed to merge duplicates',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
        <p className="text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("settings.notifications")}
          </CardTitle>
          <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="low-stock-alerts">{t("settings.lowStockAlerts")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.lowStockAlertsDesc")}
              </p>
            </div>
            <Switch
              id="low-stock-alerts"
              checked={settings.lowStockAlerts}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, lowStockAlerts: checked })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="threshold">{t("settings.lowStockThreshold")}</Label>
            <div className="flex items-center gap-4">
              <Input
                id="threshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => 
                  setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })
                }
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">
                {t("settings.thresholdDesc")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t("settings.display")}
          </CardTitle>
          <CardDescription>{t("settings.displayDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">{t("settings.theme")}</Label>
            <Select 
              value={theme} 
              onValueChange={(value: any) => setTheme(value)}
            >
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("settings.light")}</SelectItem>
                <SelectItem value="dark">{t("settings.dark")}</SelectItem>
                <SelectItem value="system">{t("settings.system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="language">{t("settings.language")}</Label>
            <Select 
              value={language} 
              onValueChange={(value: any) => setLanguage(value)}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t("settings.languageDesc")}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="items-per-page">{t("settings.itemsPerPage")}</Label>
            <Select 
              value={settings.itemsPerPage.toString()} 
              onValueChange={(value) => setSettings({ ...settings, itemsPerPage: parseInt(value) })}
            >
              <SelectTrigger id="items-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {t("settings.dataManagement")}
          </CardTitle>
          <CardDescription>{t("settings.dataManagementDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">{t("settings.autoBackup")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("settings.autoBackupDesc")}
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, autoBackup: checked })
              }
            />
          </div>

          {settings.autoBackup && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">{t("settings.backupFrequency")}</Label>
                <Select 
                  value={settings.backupFrequency} 
                  onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                >
                  <SelectTrigger id="backup-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">{t("settings.hourly")}</SelectItem>
                    <SelectItem value="daily">{t("settings.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("settings.weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("settings.monthly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="data-retention">{t("settings.dataRetention")}</Label>
            <Select 
              value={settings.dataRetention} 
              onValueChange={(value) => setSettings({ ...settings, dataRetention: value })}
            >
              <SelectTrigger id="data-retention">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">{t("settings.30days")}</SelectItem>
                <SelectItem value="90">{t("settings.90days")}</SelectItem>
                <SelectItem value="180">{t("settings.180days")}</SelectItem>
                <SelectItem value="365">{t("settings.1year")}</SelectItem>
                <SelectItem value="unlimited">{t("settings.unlimited")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>{t("settings.dataOperations")}</Label>
            
            {/* Export/Import Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                {t("settings.exportData")} (JSON)
              </Button>
              <Button variant="outline" onClick={handleImportData}>
                <Upload className="mr-2 h-4 w-4" />
                {t("settings.importData")}
              </Button>
              <Button variant="outline" onClick={handleMergeDuplicates}>
                <Database className="mr-2 h-4 w-4" />
                {language === 'zh' ? '合并重复元件' : 'Merge Duplicates'}
              </Button>
              <Button variant="destructive" onClick={handleClearData}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("settings.clearData")}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {language === 'zh' ? '导出格式：JSON（完整备份）| 导入支持：JSON 和立创商城订单文件' : 'Export: JSON (Full Backup) | Import: JSON and LCSC Order Files'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("settings.cancel")}
        </Button>
        <Button onClick={handleSave}>
          <SettingsIcon className="mr-2 h-4 w-4" />
          {t("settings.saveSettings")}
        </Button>
      </div>
    </div>
  );
}
