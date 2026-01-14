import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingDown, TrendingUp, Download, Calendar, Package } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";

type ExportFormat = "json";

export default function Reports() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("30");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  const { data: components = [] } = useQuery({
    queryKey: ["/api/components"],
    queryFn: async () => {
      const response = await fetch("/api/components");
      if (!response.ok) throw new Error("Failed to fetch components");
      return response.json();
    }
  });

  // Calculate category distribution
  const categoryStats = components.reduce((acc: any, comp: any) => {
    acc[comp.category] = (acc[comp.category] || 0) + 1;
    return acc;
  }, {});

  // Calculate stock value by category
  const stockValueByCategory = components.reduce((acc: any, comp: any) => {
    acc[comp.category] = (acc[comp.category] || 0) + comp.quantity;
    return acc;
  }, {});

  // Find most/least stocked items
  const sortedByQuantity = [...components].sort((a: any, b: any) => b.quantity - a.quantity);
  const topStocked = sortedByQuantity.slice(0, 5);
  const lowStocked = sortedByQuantity.slice(-5).reverse();

  const handleExport = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      exportReportAsJSON(timestamp);
      
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

  const exportReportAsJSON = (timestamp: string) => {
    const data = {
      generatedAt: new Date().toISOString(),
      timeRange: `${timeRange} days`,
      summary: stats,
      categoryDistribution: categoryStats,
      stockValueByCategory,
      topStockedItems: topStocked,
      lowStockedItems: lowStocked,
      allComponents: components
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `inventory-report-${timestamp}.json`);
  };

  const exportReportAsCSV = (timestamp: string) => {
    const headers = ['ID', 'Name', 'Description', 'Category', 'Quantity', 'Location', 'Min Stock Level', 'Specifications', 'Status'];
    
    const rows = components.map((comp: any) => {
      const status = comp.quantity === 0 ? 'Out of Stock' : 
                     comp.quantity <= (comp.minStockLevel || 10) ? 'Low Stock' : 'In Stock';
      return [
        comp.id,
        `"${comp.name || ''}"`,
        `"${comp.description || ''}"`,
        `"${comp.category || ''}"`,
        comp.quantity || 0,
        `"${comp.location || ''}"`,
        comp.minStockLevel || 0,
        `"${comp.specifications ? JSON.stringify(comp.specifications) : ''}"`,
        `"${status}"`
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `inventory-report-${timestamp}.csv`);
  };

  const exportReportAsExcel = (timestamp: string) => {
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"><style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #4CAF50; color: white; }</style></head>';
    html += '<body>';
    
    // Summary section
    html += '<h2>Inventory Report</h2>';
    html += '<table><tr><th>Metric</th><th>Value</th></tr>';
    html += `<tr><td>Total Components</td><td>${stats?.totalComponents || 0}</td></tr>`;
    html += `<tr><td>Total Quantity</td><td>${stats?.totalQuantity || 0}</td></tr>`;
    html += `<tr><td>Low Stock Items</td><td>${stats?.lowStockCount || 0}</td></tr>`;
    html += `<tr><td>Categories</td><td>${stats?.categories || 0}</td></tr>`;
    html += '</table><br/>';
    
    // Components table
    html += '<h3>All Components</h3>';
    html += '<table><tr><th>ID</th><th>Name</th><th>Description</th><th>Category</th><th>Quantity</th><th>Location</th><th>Min Stock Level</th><th>Specifications</th><th>Status</th></tr>';
    
    components.forEach((comp: any) => {
      const status = comp.quantity === 0 ? 'Out of Stock' : 
                     comp.quantity <= (comp.minStockLevel || 10) ? 'Low Stock' : 'In Stock';
      html += '<tr>';
      html += `<td>${comp.id || ''}</td>`;
      html += `<td>${comp.name || ''}</td>`;
      html += `<td>${comp.description || ''}</td>`;
      html += `<td>${comp.category || ''}</td>`;
      html += `<td>${comp.quantity || 0}</td>`;
      html += `<td>${comp.location || ''}</td>`;
      html += `<td>${comp.minStockLevel || 0}</td>`;
      html += `<td>${comp.specifications ? JSON.stringify(comp.specifications) : ''}</td>`;
      html += `<td>${status}</td>`;
      html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    downloadFile(blob, `inventory-report-${timestamp}.xls`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h2>
          <p className="text-muted-foreground mt-1">{t("reports.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("reports.last7days")}</SelectItem>
              <SelectItem value="30">{t("reports.last30days")}</SelectItem>
              <SelectItem value="90">{t("reports.last90days")}</SelectItem>
              <SelectItem value="365">{t("reports.lastYear")}</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("reports.exportReport")} (JSON)
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.totalInventoryValue")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalQuantity || 0} {t("reports.units")}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("reports.across")} {stats?.totalComponents || 0} {t("reports.componentTypes")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.stockHealth")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats?.totalComponents && stats?.lowStockCount 
                ? Math.round(((stats.totalComponents - stats.lowStockCount) / stats.totalComponents) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("reports.adequateStock")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.lowStockItems")}</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats?.lowStockCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("reports.requireAttention")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {t("reports.categoryDistribution")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, count]: [string, any]) => {
              const percentage = (count / components.length) * 100;
              const totalQuantity = stockValueByCategory[category] || 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t(`category.${category}`)}</span>
                    <span className="text-muted-foreground">
                      {count} {t("reports.types")} • {totalQuantity} {t("reports.units")}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top and Low Stocked Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              {t("reports.topStocked")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStocked.map((comp: any, index: number) => (
                <div key={comp.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600 dark:text-green-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{comp.name}</p>
                      <p className="text-xs text-muted-foreground">{t(`category.${comp.category}`)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">{comp.quantity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <TrendingDown className="h-5 w-5" />
              {t("reports.lowStocked")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStocked.map((comp: any, index: number) => (
                <div key={comp.id} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-600 dark:text-amber-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-sm">{comp.name}</p>
                      <p className="text-xs text-muted-foreground">{t(`category.${comp.category}`)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{comp.quantity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
