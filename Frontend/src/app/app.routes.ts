import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
    {
        path: '', 
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [roleGuard],
        data: { roles: ['GUEST', 'USER'] },
    },
    {
        path: 'bookings', 
        loadComponent: () => import('./bookings/bookings-list/bookings-list').then(m => m.BookingsList), 
        canActivate: [authGuard, roleGuard],
        data: { roles: ['USER'] },
    },
    {
        path: 'venues/new', 
        loadComponent: () => import('./venues/venue-create/venue-create').then(m => m.VenueCreate), 
        canActivate: [authGuard, roleGuard],
        data: { roles: ['VENUE_OWNER'] },
    },
    { 
        path: 'venues/manage/:id', 
        loadComponent: () => import('./venues/venue-manage/venue-manage').then(m => m.VenueManagement), 
        canActivate: [authGuard, roleGuard],
        data: { roles: ['VENUE_OWNER'] },
    },
    {
        path: 'venues/:id', 
        loadComponent: () => import('./venues/venue-detail/venue-detail').then(m => m.VenueDetail),
        canActivate: [roleGuard],
        data: { roles: ['GUEST', 'USER'] },
    },
    {
        path: 'venues', 
        loadComponent: () => import('./venues/venue-list/venue-list').then(m => m.VenueList), 
        canActivate: [authGuard, roleGuard],
        data: { roles: ['VENUE_OWNER'] },
    },
    {
        path: 'admin', 
        loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboard), 
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] },
    },
];
