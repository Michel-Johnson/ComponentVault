import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Trash2, Plus, Minus, Microchip, Circle, Zap, ArrowUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import type { Component } from "@shared/schema";
import EditComponentDialog from "@/components/edit-component-dialog";
import DeleteComponentDialog from "@/components/delete-component-dialog";

interface ComponentsTableProps {
  components: Component[];
  isLoading: boolean;
}

export default function ComponentsTable({ components, isLoading }: ComponentsTableProps) {
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<Component | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      await apiRequest("PATCH", `/api/components/${id}`, { quantity: Math.max(0, quantity) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/components/alerts/low-stock"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive"
      });
    }
  });

  const handleQuantityChange = (component: Component, newQuantity: number) => {
    updateQuantityMutation.mutate({ id: component.id, quantity: newQuantity });
  };

  const getStatusInfo = (component: Component) => {
    if (component.quantity === 0) {
      return { label: t("table.outOfStock"), color: "destructive", dotColor: "bg-red-400" };
    } else if (component.quantity <= component.minStockLevel) {
      return { label: t("table.lowStock"), color: "secondary", dotColor: "bg-amber-400" };
    } else {
      return { label: t("table.inStock"), color: "secondary", dotColor: "bg-green-400" };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Integrated Circuits": return Microchip;
      case "Capacitors": return Circle;
      case "Resistors": return Zap;
      case "Transistors": return ArrowUp;
      default: return Microchip;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Integrated Circuits": return "bg-blue-100 text-blue-800";
      case "Capacitors": return "bg-orange-100 text-orange-800";
      case "Resistors": return "bg-green-100 text-green-800";
      case "Transistors": return "bg-purple-100 text-purple-800";
      case "Diodes": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[150px]" />
                </div>
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="h-8 w-[120px]" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (components.length === 0) {
    return (
      <Card className="shadow-sm">
        <div className="p-12 text-center">
          <Microchip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t("table.noComponents")}</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("table.component")}
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("table.category")}
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("table.quantity")}
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("table.location")}
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("table.specifications")}
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("table.status")}
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {t("table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {components.map((component) => {
                const Icon = getCategoryIcon(component.category);
                const status = getStatusInfo(component);
                
                return (
                  <TableRow key={component.id} className="hover:bg-muted/30 transition-colors" data-testid={`row-component-${component.id}`}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Icon className="text-blue-600 h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-base font-medium text-foreground" data-testid={`text-component-name-${component.id}`}>
                            {component.name}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-component-description-${component.id}`}>
                            {component.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge className={`${getCategoryColor(component.category)} whitespace-nowrap text-base px-3 py-1`} data-testid={`badge-category-${component.id}`}>
                        {t(`category.${component.category}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handleQuantityChange(component, component.quantity - 1)}
                          disabled={component.quantity === 0 || updateQuantityMutation.isPending}
                          data-testid={`button-decrease-${component.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          className="w-20 text-center text-base font-medium"
                          value={component.quantity}
                          onChange={(e) => handleQuantityChange(component, parseInt(e.target.value) || 0)}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`input-quantity-${component.id}`}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => handleQuantityChange(component, component.quantity + 1)}
                          disabled={updateQuantityMutation.isPending}
                          data-testid={`button-increase-${component.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-base text-muted-foreground" data-testid={`text-location-${component.id}`}>
                      {component.location}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-base text-muted-foreground" data-testid={`text-specifications-${component.id}`}>
                      {component.specifications && Object.keys(component.specifications).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(component.specifications).map(([key, value]) => (
                            value && <div key={key} className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground text-base">{t(`spec.${key}`)}:</span>
                              <span className="text-base">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center whitespace-nowrap">
                        <div className={`w-2 h-2 ${status.dotColor} rounded-full mr-2`}></div>
                        <span className={`text-base font-medium ${
                          status.label === "Low Stock" || status.label === "库存不足" ? "text-amber-600" : 
                          status.label === "Out of Stock" || status.label === "缺货" ? "text-destructive" : 
                          "text-foreground"
                        }`} data-testid={`text-status-${component.id}`}>
                          {status.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary p-2"
                          onClick={() => setEditingComponent(component)}
                          data-testid={`button-edit-${component.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive p-2"
                          onClick={() => setDeletingComponent(component)}
                          data-testid={`button-delete-${component.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <EditComponentDialog
        component={editingComponent}
        open={!!editingComponent}
        onOpenChange={(open) => !open && setEditingComponent(null)}
      />

      <DeleteComponentDialog
        component={deletingComponent}
        open={!!deletingComponent}
        onOpenChange={(open) => !open && setDeletingComponent(null)}
      />
    </>
  );
}
