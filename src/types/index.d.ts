import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: string;
  };
}

// src/modules/vehicles/dtos/vehicle-attributes.interface.ts
export interface VehicleAttributes {
  make?: string;
  brand?: string;
  color?: string;
  year?: number;
  [key: string]: any; // Allows for additional dynamic properties
}
