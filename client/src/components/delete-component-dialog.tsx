import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Component } from "@shared/schema";

interface DeleteComponentDialogProps {
  component: Component | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteComponentDialog({ component, open, onOpenChange }: DeleteComponentDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteComponentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/components/${component?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/components"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/components/alerts/low-stock"] });
      toast({
        title: "Success",
        description: "Component deleted successfully"
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete component",
        variant: "destructive"
      });
    }
  });

  const handleConfirmDelete = () => {
    deleteComponentMutation.mutate();
  };

  if (!component) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-delete-component">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-destructive h-6 w-6" />
            </div>
            <div>
              <DialogTitle>Delete Component</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete{" "}
            <span className="font-medium" data-testid="text-component-to-delete">
              "{component.name}"
            </span>
            ? This will permanently remove the component from your inventory.
          </p>

          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-delete"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteComponentMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteComponentMutation.isPending ? "Deleting..." : "Delete Component"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
