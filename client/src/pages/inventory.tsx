import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Search, Bell, User, Microchip } from "lucide-react";
import StatsOverview from "@/components/stats-overview";
import ComponentsTable from "@/components/components-table";
import AddComponentDialog from "@/components/add-component-dialog";
import { COMPONENT_CATEGORIES } from "@shared/schema";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: components = [], isLoading } = useQuery({
    queryKey: ["/api/components", searchQuery, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "All Categories") params.append("category", selectedCategory);
      
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Microchip className="text-primary-foreground text-sm" />
                </div>
                <h1 className="text-xl font-bold text-foreground">ElectroVault</h1>
              </div>
              <nav className="hidden md:flex space-x-1">
                <Button variant="default" size="sm" data-testid="nav-inventory">
                  Inventory
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="nav-reports">
                  Reports
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="nav-settings">
                  Settings
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Bell className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                {lowStockComponents.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
                )}
              </div>
              <Button variant="secondary" size="icon" className="rounded-full" data-testid="user-menu">
                <User className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview />

        {/* Search and Filters */}
        <div className="bg-card rounded-lg border border-border p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search components..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-components"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  {COMPONENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-component">
                <Plus className="mr-2 h-4 w-4" />
                Add Component
              </Button>
            </div>
          </div>
        </div>

        <ComponentsTable components={components} isLoading={isLoading} />

        {/* Low Stock Alert */}
        {lowStockComponents.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="text-amber-600 h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Low Stock Alert</p>
                <p className="text-sm text-amber-700 mt-1" data-testid="text-low-stock-count">
                  {lowStockComponents.length} components are running low on stock
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <AddComponentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}
