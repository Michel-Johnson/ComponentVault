import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { apiRequest } from "@/lib/queryClient";
import { insertComponentSchema, COMPONENT_CATEGORIES, CATEGORY_SPEC_FIELDS } from "@shared/schema";
import { z } from "zod";

interface AddComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddComponentDialog({ open, onOpenChange }: AddComponentDialogProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    location: "",
    description: "",
    minStockLevel: ""
  });
  const [specifications, setSpecifications] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createComponentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/components", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/components/alerts/low-stock"] });
      toast({
        title: "Success",
        description: "Component added successfully"
      });
      onOpenChange(false);
      setFormData({
        name: "",
        category: "",
        quantity: "",
        location: "",
        description: "",
        minStockLevel: ""
      });
      setSpecifications({});
      setErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add component",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = insertComponentSchema.parse({
        name: formData.name,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 0,
        location: formData.location,
        description: formData.description,
        minStockLevel: parseInt(formData.minStockLevel) || 10,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined
      });

      createComponentMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };
  
  const updateSpecification = (key: string, value: string) => {
    setSpecifications((prev: any) => ({ ...prev, [key]: value }));
  };
  
  // 获取当前类别的参数字段
  const specFields = CATEGORY_SPEC_FIELDS[formData.category as keyof typeof CATEGORY_SPEC_FIELDS] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-component">
        <DialogHeader>
          <DialogTitle>Add New Component</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Component Name</Label>
            <Input
              id="name"
              placeholder="e.g., ATmega328P-PU"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              data-testid="input-name"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => updateFormData("category", value)}>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {COMPONENT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                min="0"
                value={formData.quantity}
                onChange={(e) => updateFormData("quantity", e.target.value)}
                data-testid="input-quantity"
              />
              {errors.quantity && <p className="text-sm text-destructive mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., A1-B3"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                data-testid="input-location"
              />
              {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
            <Input
              id="minStockLevel"
              type="number"
              placeholder="10"
              min="0"
              value={formData.minStockLevel}
              onChange={(e) => updateFormData("minStockLevel", e.target.value)}
              data-testid="input-min-stock"
            />
            {errors.minStockLevel && <p className="text-sm text-destructive mt-1">{errors.minStockLevel}</p>}
          </div>

          {/* 根据类别显示特定参数字段 */}
          {specFields.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {language === 'zh' ? '元件参数' : 'Component Specifications'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {specFields.map((field) => (
                  <div key={field.key}>
                    <Label htmlFor={`spec-${field.key}`}>
                      {language === 'zh' ? field.labelZh : field.label}
                    </Label>
                    <Input
                      id={`spec-${field.key}`}
                      value={specifications[field.key] || ''}
                      onChange={(e) => updateSpecification(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Component description and specifications..."
              rows={3}
              value={formData.description}
              onChange={(e) => updateFormData("description", e.target.value)}
              data-testid="textarea-description"
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={createComponentMutation.isPending} data-testid="button-save">
              {createComponentMutation.isPending ? "Adding..." : "Add Component"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
