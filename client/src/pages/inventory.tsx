import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search, Bell, Database } from "lucide-react";
import StatsOverview from "@/components/stats-overview";
import ComponentsTable from "@/components/components-table";
import AddComponentDialog from "@/components/add-component-dialog";
import { COMPONENT_CATEGORIES } from "@shared/schema";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);

  const { data: components = [], isLoading } = useQuery({
    queryKey: ["/api/components", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      
      const response = await fetch(`/api/components?${params}`);
      if (!response.ok) throw new Error("Failed to fetch components");
      return response.json();
    }
  });

  const { data: lowStockComponents = [] } = useQuery({
    queryKey: ["/api/components/alerts/low-stock"],
    queryFn: async () => {
      const response = await fetch("/api/components/alerts/low-stock");
      if (!response.ok) throw new Error("Failed to fetch low stock components");
      return response.json();
    }
  });

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
    <>
      <StatsOverview />

      {/* Search and Filters */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t("inventory.search")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-components"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48" data-testid="filter-category">
                <SelectValue>
                  {selectedCategory === "all" ? t("inventory.allCategories") : t(`category.${selectedCategory}`)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("inventory.allCategories")}</SelectItem>
                {COMPONENT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(`category.${category}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleMergeDuplicates}>
              <Database className="mr-2 h-4 w-4" />
              {language === 'zh' ? '合并重复' : 'Merge Duplicates'}
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-component">
              <Plus className="mr-2 h-4 w-4" />
              {t("inventory.addComponent")}
            </Button>
          </div>
        </div>
      </div>

      <ComponentsTable components={components} isLoading={isLoading} />

      {/* Low Stock Alert */}
      {lowStockComponents.length > 0 && showLowStockAlert && (
        <div className="fixed bottom-4 right-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="text-amber-600 dark:text-amber-400 h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{t("inventory.lowStockAlert")}</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1" data-testid="text-low-stock-count">
                {lowStockComponents.length} {t("inventory.lowStockMessage")}
              </p>
            </div>
            <button
              onClick={() => setShowLowStockAlert(false)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors ml-2"
              aria-label="Close alert"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <AddComponentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
