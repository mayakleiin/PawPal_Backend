import { Request, Response } from "express";
import { Model, Document, Types } from "mongoose";


interface Ownable {
  owner: Types.ObjectId;
}


export class BaseController<T extends Document & Ownable> {
  constructor(private model: Model<T>) {}

  // Create a new item
  async create(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const newItem = new this.model({ ...req.body, owner: new Types.ObjectId(userId) });
      const savedItem = await newItem.save();
      res.status(201).json(savedItem); 
    } catch (error) {
      res.status(400).json({ error: "Failed to create item", details: error }); 
    }
  }

  // Get all items
  async getAll(req: Request, res: Response) {
    try {
      const ownerFilter = req.query.owner as string;
      const query = ownerFilter ? { owner: ownerFilter } : {};
      const items = await this.model.find(query);
      res.status(200).json(items); 
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch items", details: error }); 
    }
  }

  // Get an item by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const item = await this.model.findById(id);
      if (item) {
        res.status(200).json(item); 
      } else {
        res.status(404).json({ error: "Item not found" }); 
      }
    } catch (error) {
      res.status(400).json({ error: "Failed to fetch item", details: error }); 
    }
  }

  // Update an item by ID
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      const currentItem = await this.model.findById(id);
      if (!currentItem) {
        res.status(404).json({ error: "Item not found" }); 
        return;
      }

      if (currentItem.owner.toString() !== userId) {
        res.status(401).json({ error: "Unauthorized to update this item" }); 
        return;
      }

      const updatedItem = await this.model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json(updatedItem); 
    } catch (error) {
      res.status(400).json({ error: "Failed to update item", details: error }); 
    }
  }

  // Delete an item by ID
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string;

      const currentItem = await this.model.findById(id);
      if (!currentItem) {
        res.status(404).json({ error: "Item not found" }); 
        return;
      }

      if (currentItem.owner.toString() !== userId) {
        res.status(401).json({ error: "Unauthorized to delete this item" }); 
        return;
      }

      await this.model.findByIdAndDelete(id);
      res.status(200).json({ message: "Item deleted successfully" }); 
    } catch (error) {
      res.status(400).json({ error: "Failed to delete item", details: error });
    }
  }
}

// Factory function to create a new controller instance
const createController = <T extends Document & Ownable>(model: Model<T>) => {
  return new BaseController(model);
};

export default createController;
