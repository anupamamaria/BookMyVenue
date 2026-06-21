import { Injectable } from '@angular/core';
import { VenueAdmin, VenueManage, VenueManageSlot } from '../shared/models/venue';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private venues: VenueAdmin[] = [
    // Featured
    { id: 1, name: 'Grand Ballroom', location: 'Kochi', price: 5000, rating: 4.88, imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400', capacity: 500, description: 'Elegant ballroom for grand celebrations', status: 'pending', userName: 'user1'  },
    { id: 2, name: 'Rooftop Terrace', location: 'Wayanad', price: 3500, rating: 4.86, imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', capacity: 200, description: 'Stunning rooftop venue with city views', status: 'pending', userName: 'user2' },
    { id: 3, name: 'Garden Pavilion', location: 'Munnar', price: 2800, rating: 4.89, imageUrl: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400', capacity: 150, description: 'Beautiful outdoor garden setting', status: 'pending', userName: 'user1' },
    { id: 4, name: 'Lakeside Manor', location: 'Wayanad', price: 4200, rating: 4.93, imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400', capacity: 300, description: 'Serene lakeside venue for weddings', status: 'pending', userName: 'user1' },
    { id: 5, name: 'The Art Loft', location: 'Kochi', price: 2000, rating: 4.89, imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', capacity: 100, description: 'Modern industrial loft space', status: 'pending', userName: 'user1' },
    { id: 6, name: 'Heritage Hall', location: 'Munnar', price: 3800, rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400', capacity: 400, description: 'Historic venue with classic charm', status: 'pending', userName: 'user1' },
  
    // Wayanad
    { id: 7, name: 'Wayanad Wild Resort', location: 'Wayanad', price: 4500, rating: 4.92, imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', capacity: 250, description: 'Nestled in the lush greenery of Wayanad hills', status: 'pending', userName: 'user1'},
    { id: 8, name: 'Bamboo Grove Villa', location: 'Wayanad', price: 3200, rating: 4.85, imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', capacity: 180, description: 'Eco-friendly bamboo villa surrounded by plantations', status: 'pending', userName: 'user2' },
    { id: 9, name: 'Edakkal Heritage', location: 'Wayanad', price: 3000, rating: 4.78, imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', capacity: 120, description: 'Heritage property near the famous Edakkal Caves', status: 'pending', userName: 'user3' },
    { id: 10, name: 'Chembra Peak Lodge', location: 'Wayanad', price: 2800, rating: 4.90, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', capacity: 100, description: 'Mountain lodge with trekking trail access', status: 'pending', userName: 'user4' },
    { id: 11, name: 'Banasura Retreat', location: 'Wayanad', price: 3500, rating: 4.87, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', capacity: 200, description: 'Lakeside retreat near Banasura Sagar Dam', status: 'pending', userName: 'user1' },
    { id: 12, name: 'Kuruva Island Stay', location: 'Wayanad', price: 2500, rating: 4.82, imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400', capacity: 80, description: 'Riverside property close to Kuruva Island', status: 'pending', userName: 'user1' },
  
    // Kochi
    { id: 13, name: 'Fort Kochi Heritage', location: 'Kochi', price: 4000, rating: 4.91, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', capacity: 300, description: 'Colonial-era heritage venue in Fort Kochi', status: 'rejected', userName: 'user1' },
    { id: 14, name: 'Marine Drive Hall', location: 'Kochi', price: 5500, rating: 4.88, imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', capacity: 500, description: 'Waterfront venue overlooking the backwaters', status: 'rejected', userName: 'user2' },
    { id: 15, name: 'Bolgatty Palace', location: 'Kochi', price: 6500, rating: 4.95, imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', capacity: 400, description: 'Island palace venue with royal ambiance', status: 'rejected', userName: 'user3' },
    { id: 16, name: 'Willingdon Club', location: 'Kochi', price: 4800, rating: 4.84, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400', capacity: 350, description: 'Exclusive club venue with manicured lawns', status: 'rejected', userName: 'user4' },
    { id: 17, name: 'Jew Town Gallery', location: 'Kochi', price: 2200, rating: 4.79, imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', capacity: 80, description: 'Art gallery venue in the historic Jew Town', status: 'rejected', userName: 'user1' },
    { id: 18, name: 'Cherai Beach House', location: 'Kochi', price: 3000, rating: 4.86, imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400', capacity: 150, description: 'Beachfront property with sunset views', status: 'rejected', userName: 'user1' },
  
    // Munnar
    { id: 19, name: 'Tea Valley Resort', location: 'Munnar', price: 3500, rating: 4.93, imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400', capacity: 200, description: 'Surrounded by rolling tea plantations', status: 'approved', userName: 'user1' },
    { id: 20, name: 'Eravikulam View', location: 'Munnar', price: 4000, rating: 4.88, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', capacity: 150, description: 'Hilltop venue with views of Eravikulam National Park', status: 'approved', userName: 'user2' },
    { id: 21, name: 'Mattupetty Lakehouse', location: 'Munnar', price: 3200, rating: 4.85, imageUrl: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=400', capacity: 120, description: 'Charming lakehouse by Mattupetty Dam', status: 'approved', userName: 'user3' },
    { id: 22, name: 'Anamudi Peak Lodge', location: 'Munnar', price: 4500, rating: 4.96, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400', capacity: 100, description: 'Exclusive hilltop lodge near the highest peak', status: 'approved', userName: 'user1' },
    { id: 23, name: 'Spice Garden Villa', location: 'Munnar', price: 2800, rating: 4.81, imageUrl: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=400', capacity: 90, description: 'Villa set within aromatic spice gardens', status: 'approved', userName: 'user1' },
    { id: 24, name: 'Top Station Retreat', location: 'Munnar', price: 3800, rating: 4.90, imageUrl: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=400', capacity: 160, description: 'Panoramic mountain views from the highest point', status: 'approved', userName: 'user1' },
  ];

  getApprovedVenues(): Observable<VenueAdmin[]> {
    return of(this.venues.filter(v => v.status === 'approved'));
  }

  getRejectedVenues(): Observable<VenueAdmin[]> {
    return of(this.venues.filter(v => v.status === 'rejected'));
  }

  getPendingVenues(): Observable<VenueAdmin[]> {
    return of(this.venues.filter(v => v.status === 'pending'));
  }
  
  getVenues(userName: string): Observable<VenueAdmin[]> {
    return of(this.venues.filter(v => v.userName === userName));
  } 
}
