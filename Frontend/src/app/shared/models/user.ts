export interface User {
    token: string;
    name: string;
    email: string;
    location: string;
    role: 'USER' | 'VENUE_OWNER';
}

export interface DashboardFilters {
  location?: string;
  type?: string;
  name?: string;
  capacity?: number;
  carParking?: boolean;
  swimmingPool?: boolean;
  startDate?: string; // yyyy-MM-dd
  endDate?: string;   // yyyy-MM-dd
}
