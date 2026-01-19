export type BusType = 'teacher' | 'student' | 'staff';
export type VehicleStatus = 'active' | 'maintenance' | 'inactive';

export interface Bus {
  id: string;
  name: string;
  type: BusType;
  capacity: number;
  status: VehicleStatus;
  currentRoute?: string;
  registrationNumber: string;
}

export interface Ambulance {
  id: string;
  name: string;
  status: VehicleStatus;
  emergencyContact: string;
}

export interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
  distance: string;
  estimatedTime: string;
  assignedBuses: string[];
}

export interface Assignment {
  id: string;
  busId: string;
  busName: string;
  passengerType: 'student' | 'teacher' | 'staff';
  passengerCount: number;
  startDate: string;
  endDate: string;
  isMonthly: boolean;
  routeId: string;
}

export interface Schedule {
  id: string;
  busId: string;
  busName: string;
  routeId: string;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  days: string[];
  isActive: boolean;
}
