import { type Component, type InsertComponent, type UpdateComponent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Component operations
  getComponents(): Promise<Component[]>;
  getComponent(id: string): Promise<Component | undefined>;
  createComponent(component: InsertComponent): Promise<Component>;
  updateComponent(id: string, updates: UpdateComponent): Promise<Component | undefined>;
  deleteComponent(id: string): Promise<boolean>;
  searchComponents(query: string): Promise<Component[]>;
  getComponentsByCategory(category: string): Promise<Component[]>;
  getLowStockComponents(): Promise<Component[]>;
  
  // User operations (existing)
  getUser(id: string): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private components: Map<string, Component>;
  private users: Map<string, any>;

  constructor() {
    this.components = new Map();
    this.users = new Map();
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleComponents: InsertComponent[] = [
      {
        name: "ATmega328P-PU",
        category: "Integrated Circuits",
        quantity: 45,
        location: "A1-B3",
        description: "8-bit AVR Microcontroller",
        minStockLevel: 10
      },
      {
        name: "470µF Electrolytic",
        category: "Capacitors",
        quantity: 8,
        location: "C2-A1", 
        description: "25V Radial Electrolytic Capacitor",
        minStockLevel: 20
      },
      {
        name: "10kΩ Resistor",
        category: "Resistors",
        quantity: 250,
        location: "R1-A5",
        description: "1/4W Carbon Film Resistor",
        minStockLevel: 50
      },
      {
        name: "2N3904 NPN",
        category: "Transistors", 
        quantity: 0,
        location: "T1-C2",
        description: "General Purpose NPN Transistor",
        minStockLevel: 15
      },
      {
        name: "1N4148 Diode",
        category: "Diodes",
        quantity: 5,
        location: "D1-A2",
        description: "High-speed switching diode",
        minStockLevel: 25
      }
    ];

    for (const comp of sampleComponents) {
      const id = randomUUID();
      const component: Component = { 
        id,
        name: comp.name,
        category: comp.category,
        quantity: comp.quantity ?? 0,
        location: comp.location,
        description: comp.description,
        minStockLevel: comp.minStockLevel ?? 10
      };
      this.components.set(id, component);
    }
  }

  async getComponents(): Promise<Component[]> {
    return Array.from(this.components.values());
  }

  async getComponent(id: string): Promise<Component | undefined> {
    return this.components.get(id);
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const id = randomUUID();
    const component: Component = { 
      id,
      name: insertComponent.name,
      category: insertComponent.category,
      quantity: insertComponent.quantity ?? 0,
      location: insertComponent.location,
      description: insertComponent.description,
      minStockLevel: insertComponent.minStockLevel ?? 10
    };
    this.components.set(id, component);
    return component;
  }

  async updateComponent(id: string, updates: UpdateComponent): Promise<Component | undefined> {
    const existing = this.components.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.components.set(id, updated);
    return updated;
  }

  async deleteComponent(id: string): Promise<boolean> {
    return this.components.delete(id);
  }

  async searchComponents(query: string): Promise<Component[]> {
    const components = Array.from(this.components.values());
    const lowerQuery = query.toLowerCase();
    
    return components.filter(component =>
      component.name.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.category.toLowerCase().includes(lowerQuery) ||
      component.location.toLowerCase().includes(lowerQuery)
    );
  }

  async getComponentsByCategory(category: string): Promise<Component[]> {
    const components = Array.from(this.components.values());
    return components.filter(component => component.category === category);
  }

  async getLowStockComponents(): Promise<Component[]> {
    const components = Array.from(this.components.values());
    return components.filter(component => component.quantity <= component.minStockLevel);
  }

  // User operations (existing)
  async getUser(id: string): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = randomUUID();
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
