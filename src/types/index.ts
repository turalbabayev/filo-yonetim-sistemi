import { Timestamp } from 'firebase/firestore';

// User types
export type UserRole = 'firma_yetkilisi' | 'dis_kaynak_personeli' | 'surucu';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Vehicle types
export type VehicleType = 'kiralik' | 'ozmal';
export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'in_use';

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  initialMileage: number;
  currentMileage: number;
  isPoolVehicle?: boolean;
  assignedDrivers?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type VehicleInput = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'assignedDrivers'>;
export type VehicleUpdate = Partial<VehicleInput>;

// Maintenance types
export type MaintenanceType = 'periyodik' | 'onarim' | 'lastik' | 'parca';

export interface Maintenance {
  id: string;
  vehicleId: string;
  date: any;
  type: string;
  description: string;
  cost: number;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export type MaintenanceInput = Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>;
export type MaintenanceUpdate = Partial<MaintenanceInput>;

// Fuel record types
export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: any;
  amount: number;
  cost: number;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
}

export type FuelInput = Omit<FuelRecord, 'id' | 'createdAt' | 'updatedAt'>;
export type FuelUpdate = Partial<FuelInput>;

// Mileage record types
export interface MileageRecord {
  id: string;
  vehicleId: string;
  mileage: number;
  recordedAt: any;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  status: 'beklemede' | 'onaylandi' | 'reddedildi';
}

export type MileageInput = Omit<MileageRecord, 'id' | 'createdAt' | 'updatedAt'>;
export type MileageUpdate = Partial<MileageInput>;

// Görev tipleri
export interface Assignment {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: 'active' | 'completed' | 'cancelled';
  kilometers: number;
  description?: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type AssignmentInput = Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>;
export type AssignmentUpdate = Partial<AssignmentInput>;

// Lastik değişimi tipleri
export interface TireChange {
  id: string;
  vehicleId: string;
  date: Timestamp;
  description: string;
  cost: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export type TireChangeInput = Omit<TireChange, 'id' | 'createdAt' | 'updatedAt'>;
export type TireChangeUpdate = Partial<TireChangeInput>;

// Parça değişimi tipleri
export type PaymentType = 'kasko' | 'ucretli';

export interface PartChange {
  id: string;
  vehicleId: string;
  date: Timestamp;
  partName: string;
  description: string;
  cost: number;
  paymentType: PaymentType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export type PartChangeInput = Omit<PartChange, 'id' | 'createdAt' | 'updatedAt'>;
export type PartChangeUpdate = Partial<PartChangeInput>;

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: any;
  description: string;
  cost: number;
  status: 'beklemede' | 'onaylandi' | 'reddedildi';
  approvedBy?: string;
  approvedAt?: any;
  createdAt: any;
  createdBy: string;
}

export interface TireChangeRecord {
  id: string;
  vehicleId: string;
  date: any;
  description: string;
  cost: number;
  status: 'beklemede' | 'onaylandi' | 'reddedildi';
  approvedBy?: string;
  approvedAt?: any;
  createdAt: any;
  createdBy: string;
}

export interface PartChangeRecord {
  id: string;
  vehicleId: string;
  date: any;
  description: string;
  cost: number;
  status: 'beklemede' | 'onaylandi' | 'reddedildi';
  approvedBy?: string;
  approvedAt?: any;
  createdAt: any;
  createdBy: string;
} 