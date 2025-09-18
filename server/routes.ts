import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertComponentSchema, updateComponentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all components
  app.get("/api/components", async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let components = await storage.getComponents();
      
      // Apply category filter first
      if (category && category !== "All Categories") {
        components = components.filter(component => component.category === category);
      }
      
      // Apply search filter to the results
      if (search) {
        const lowerQuery = (search as string).toLowerCase();
        components = components.filter(component =>
          component.name.toLowerCase().includes(lowerQuery) ||
          component.description.toLowerCase().includes(lowerQuery) ||
          component.category.toLowerCase().includes(lowerQuery) ||
          component.location.toLowerCase().includes(lowerQuery)
        );
      }
      
      res.json(components);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch components" });
    }
  });

  // Get component by ID
  app.get("/api/components/:id", async (req, res) => {
    try {
      const component = await storage.getComponent(req.params.id);
      if (!component) {
        return res.status(404).json({ error: "Component not found" });
      }
      res.json(component);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch component" });
    }
  });

  // Create new component
  app.post("/api/components", async (req, res) => {
    try {
      const validated = insertComponentSchema.parse(req.body);
      const component = await storage.createComponent(validated);
      res.status(201).json(component);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create component" });
    }
  });

  // Update component
  app.patch("/api/components/:id", async (req, res) => {
    try {
      const validated = updateComponentSchema.parse(req.body);
      const component = await storage.updateComponent(req.params.id, validated);
      if (!component) {
        return res.status(404).json({ error: "Component not found" });
      }
      res.json(component);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update component" });
    }
  });

  // Delete component
  app.delete("/api/components/:id", async (req, res) => {
    try {
      const success = await storage.deleteComponent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Component not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete component" });
    }
  });

  // Get low stock components
  app.get("/api/components/alerts/low-stock", async (req, res) => {
    try {
      const components = await storage.getLowStockComponents();
      res.json(components);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch low stock components" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const allComponents = await storage.getComponents();
      const lowStockComponents = await storage.getLowStockComponents();
      
      const totalComponents = allComponents.length;
      const totalQuantity = allComponents.reduce((sum, c) => sum + c.quantity, 0);
      const categories = new Set(allComponents.map(c => c.category)).size;
      const lowStockCount = lowStockComponents.length;
      
      res.json({
        totalComponents,
        totalQuantity,
        categories,
        lowStockCount
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
