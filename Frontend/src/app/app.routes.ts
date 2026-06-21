import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
    {path: '', loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)},
    {path: 'bookings', loadComponent: () => import('./bookings/bookings-list/bookings-list').then(m => m.BookingsList), canActivate: [authGuard]},
    {path: 'venues/new', loadComponent: () => import('./venues/venue-create/venue-create').then(m => m.VenueCreate)},
    { path: 'venues/manage/:id', loadComponent: () => import('./venues/venue-manage/venue-manage').then(m => m.VenueManagement) },
    {path: 'venues/:id', loadComponent: () => import('./venues/venue-detail/venue-detail').then(m => m.VenueDetail)},
    {path: 'venues', loadComponent: () => import('./venues/venue-list/venue-list').then(m => m.VenueList)},
    {path: 'admin', loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)},
];
