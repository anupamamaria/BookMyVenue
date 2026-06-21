export interface User {
    token: string;
    name: string;
    email: string;
    location: string;
    role: 'USER' | 'VENUE_OWNER';
}
