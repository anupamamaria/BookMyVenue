import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Venue, VenueManage, VenueManageSlot, VenueSlot } from '../shared/models/venue';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VenueService {
  private baseUrl: string='';
  private venues: Venue[] = [
    // Featured
    { id: 1, name: 'Grand Ballroom', location: 'Kochi', price: 5000, rating: 4.88, imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 500, description: 'Elegant ballroom for grand celebrations', featured: true, amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 2, name: 'Rooftop Terrace', location: 'Wayanad', price: 3500, rating: 4.86, imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 200, description: 'Stunning rooftop venue with city views', featured: true, amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 3, name: 'Garden Pavilion', location: 'Munnar', price: 2800, rating: 4.89, imageUrl: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 150, description: 'Beautiful outdoor garden setting', featured: true, amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 4, name: 'Lakeside Manor', location: 'Wayanad', price: 4200, rating: 4.93, imageUrl: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 300, description: 'Serene lakeside venue for weddings', featured: true, amenities: { swimmingPool: true, outsideCateringAllowed: true, carParking: true } },
    { id: 5, name: 'The Art Loft', location: 'Kochi', price: 2000, rating: 4.89, imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 100, description: 'Modern industrial loft space', featured: true, amenities: { swimmingPool: false, outsideCateringAllowed: false, carParking: true } },
    { id: 6, name: 'Heritage Hall', location: 'Munnar', price: 3800, rating: 5.0, imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 400, description: 'Historic venue with classic charm', featured: true, amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },

    // Wayanad
    { id: 7, name: 'Wayanad Wild Resort', location: 'Wayanad', price: 4500, rating: 4.92, imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 250, description: 'Nestled in the lush greenery of Wayanad hills', amenities: { swimmingPool: true, outsideCateringAllowed: true, carParking: true } },
    { id: 8, name: 'Bamboo Grove Villa', location: 'Wayanad', price: 3200, rating: 4.85, imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', 
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ],capacity: 180, description: 'Eco-friendly bamboo villa surrounded by plantations', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 9, name: 'Edakkal Heritage', location: 'Wayanad', price: 3000, rating: 4.78, imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', 
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ],capacity: 120, description: 'Heritage property near the famous Edakkal Caves', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 10, name: 'Chembra Peak Lodge', location: 'Wayanad', price: 2800, rating: 4.90, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 100, description: 'Mountain lodge with trekking trail access', amenities: { swimmingPool: false, outsideCateringAllowed: false, carParking: true } },
    { id: 11, name: 'Banasura Retreat', location: 'Wayanad', price: 3500, rating: 4.87, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 200, description: 'Lakeside retreat near Banasura Sagar Dam', amenities: { swimmingPool: true, outsideCateringAllowed: true, carParking: true } },
    { id: 12, name: 'Kuruva Island Stay', location: 'Wayanad', price: 2500, rating: 4.82, imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400', 
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ],capacity: 80, description: 'Riverside property close to Kuruva Island', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: false } },

    // Kochi
    { id: 13, name: 'Fort Kochi Heritage', location: 'Kochi', price: 4000, rating: 4.91, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ],capacity: 300, description: 'Colonial-era heritage venue in Fort Kochi', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 14, name: 'Marine Drive Hall', location: 'Kochi', price: 5500, rating: 4.88, imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 500, description: 'Waterfront venue overlooking the backwaters', amenities: { swimmingPool: true, outsideCateringAllowed: true, carParking: true } },
    { id: 15, name: 'Bolgatty Palace', location: 'Kochi', price: 6500, rating: 4.95, imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 400, description: 'Island palace venue with royal ambiance', amenities: { swimmingPool: true, outsideCateringAllowed: false, carParking: true } },
    { id: 16, name: 'Willingdon Club', location: 'Kochi', price: 4800, rating: 4.84, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 350, description: 'Exclusive club venue with manicured lawns', amenities: { swimmingPool: true, outsideCateringAllowed: true, carParking: true } },
    { id: 17, name: 'Jew Town Gallery', location: 'Kochi', price: 2200, rating: 4.79, imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 80, description: 'Art gallery venue in the historic Jew Town', amenities: { swimmingPool: false, outsideCateringAllowed: false, carParking: false } },
    { id: 18, name: 'Cherai Beach House', location: 'Kochi', price: 3000, rating: 4.86, imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 150, description: 'Beachfront property with sunset views', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },

    // Munnar
    { id: 19, name: 'Tea Valley Resort', location: 'Munnar', price: 3500, rating: 4.93, imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400',images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 200, description: 'Surrounded by rolling tea plantations', amenities: { swimmingPool: true, outsideCateringAllowed: true, carParking: true } },
    { id: 20, name: 'Eravikulam View', location: 'Munnar', price: 4000, rating: 4.88, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 150, description: 'Hilltop venue with views of Eravikulam National Park', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 21, name: 'Mattupetty Lakehouse', location: 'Munnar', price: 3200, rating: 4.85, imageUrl: 'https://images.unsplash.com/photo-1439130490301-25e322d88054?w=400',images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 120, description: 'Charming lakehouse by Mattupetty Dam', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: true } },
    { id: 22, name: 'Anamudi Peak Lodge', location: 'Munnar', price: 4500, rating: 4.96, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400',images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 100, description: 'Exclusive hilltop lodge near the highest peak', amenities: { swimmingPool: false, outsideCateringAllowed: false, carParking: true } },
    { id: 23, name: 'Spice Garden Villa', location: 'Munnar', price: 2800, rating: 4.81, imageUrl: 'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=400',images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 90, description: 'Villa set within aromatic spice gardens', amenities: { swimmingPool: false, outsideCateringAllowed: true, carParking: false } },
    { id: 24, name: 'Top Station Retreat', location: 'Munnar', price: 3800, rating: 4.90, imageUrl: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=400',images: [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800',
        'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800',
      ], capacity: 160, description: 'Panoramic mountain views from the highest point', amenities: { swimmingPool: true, outsideCateringAllowed: true, carParking: true } },
  ];


  private venueSlots: { [venueId: number]: VenueManageSlot[] } = {
    1: [
      { id: 1, startdate: '2026-06-25', enddate: '2026-06-25', start: '09:00', end: '14:00', price: 15000, slotType: 'fixed', isBooked: true,  bookedBy: 'john_doe',  bookingStatus: 'confirmed', guests: 150 },
      { id: 2, startdate: '2026-06-25', enddate: '2026-06-25', start: '15:00', end: '22:00', price: 20000, slotType: 'fixed', isBooked: false },
      { id: 3, startdate: '2026-06-28', enddate: '2026-06-28', start: '10:00', end: '18:00', price: 18000, slotType: 'fixed', isBooked: true,  bookedBy: 'sarah_k',   bookingStatus: 'confirmed', guests: 200 },
      { id: 4, startdate: '2026-07-01', enddate: '2026-07-03', start: '08:00', end: '23:00', price: 50000, slotType: 'fixed', isBooked: false },
    ],
    3: [
      { id: 5, startdate: '2026-06-22', enddate: '2026-06-22', start: '10:00', end: '16:00', price: 8000,  slotType: 'fixed', isBooked: true,  bookedBy: 'mike_r',    bookingStatus: 'pending',   guests: 80 },
      { id: 6, startdate: '2026-06-29', enddate: '2026-06-29', start: '14:00', end: '20:00', price: 8000,  slotType: 'fixed', isBooked: false },
    ],
    4: [
      { id: 7, startdate: '2026-06-24', enddate: '2026-06-24', start: '11:00', end: '22:00', price: 25000, slotType: 'fixed', isBooked: true,  bookedBy: 'priya_m',   bookingStatus: 'confirmed', guests: 250 },
      { id: 8, startdate: '2026-06-30', enddate: '2026-07-01', start: '10:00', end: '22:00', price: 45000, slotType: 'fixed', isBooked: false },
    ],
    5: [
      { id: 9, startdate: '2026-06-23', enddate: '2026-06-23', start: '09:00', end: '17:00', price: 10000, slotType: 'fixed', isBooked: false },
    ],
    6: [
      { id: 10, startdate: '2026-06-26', enddate: '2026-06-26', start: '18:00', end: '23:00', price: 12000, slotType: 'fixed', isBooked: true,  bookedBy: 'rahul_v',   bookingStatus: 'cancelled', guests: 100 },
      { id: 11, startdate: '2026-07-05', enddate: '2026-07-05', start: '10:00', end: '20:00', price: 16000, slotType: 'fixed', isBooked: false },
    ],
    7: [
      { id: 12, startdate: '2026-06-27', enddate: '2026-06-27', start: '09:00', end: '18:00', price: 22000, slotType: 'fixed', isBooked: true,  bookedBy: 'deepa_s',   bookingStatus: 'confirmed', guests: 180 },
      { id: 13, startdate: '2026-07-04', enddate: '2026-07-06', start: '08:00', end: '22:00', price: 60000, slotType: 'fixed', isBooked: false },
    ],
  };
  
  constructor(private http: HttpClient) {
    this.baseUrl = 'http://localhost:8080/';
  }

  getVenues(): Observable<Venue[]> {
    return of(this.venues);
  }

  getFeaturedVenues(): Observable<Venue[]> {
    return of(this.venues.filter(v => v.featured));
  }

  getVenuesByLocation(location: string): Observable<Venue[]> {
    return of(this.venues.filter(v => v.location === location));
  }

  getVenueById(id: number): Observable<Venue | undefined> {
    return of(this.venues.find(v => v.id === id));
  }

  searchVenues(
    searchTerm: string = '', 
    location: string = '', 
    minCapacity: number = 0,
    amenities: {
      swimmingPool?: boolean;
      outsideCateringAllowed?: boolean;
      carParking?: boolean;
    } = {}
  ): Observable<Venue[]> {
    let results = [...this.venues];

    // Filter by search term (name or description)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(v => 
        v.name.toLowerCase().includes(term) || 
        v.description.toLowerCase().includes(term) ||
        v.location.toLowerCase().includes(term)
      );
    }

    // Filter by location
    if (location.trim()) {
      const loc = location.toLowerCase();
      results = results.filter(v => v.location.toLowerCase().includes(loc));
    }

    // Filter by capacity
    if (minCapacity > 0) {
      results = results.filter(v => v.capacity >= minCapacity);
    }

    // Filter by amenities
    if (amenities.swimmingPool) {
      results = results.filter(v => v.amenities?.swimmingPool === true);
    }
    if (amenities.outsideCateringAllowed) {
      results = results.filter(v => v.amenities?.outsideCateringAllowed === true);
    }
    if (amenities.carParking) {
      results = results.filter(v => v.amenities?.carParking === true);
    }

    return of(results);
  }

  getVenueManage(id: number): Observable<VenueManage> {
   const venue = this.venues.find(v => v.id === id) ?? this.venues[0];
   return of({
     ...venue,
     userName: 'venue_owner',
     status: 'approved' as const,
     slots: this.venueSlots[id] ?? []
   });
  }

  /**
   * Returns available time slots for a venue across a date range.
   * Daily slots are generated for every day in the range.
   * Multi-day packages are added when the range spans 2+ days.
   */
  getVenueSlots(venueId: number, startDate: string, endDate: string): Observable<VenueSlot[]> {
    const venue = this.venues.find(v => v.id === venueId);
    if (!venue) return of([]);

    const dailyTemplates: { start: string; end: string; multiplier: number }[] = [
      { start: '09:00', end: '13:00', multiplier: 0.6 },
      { start: '14:00', end: '18:00', multiplier: 0.6 },
      { start: '19:00', end: '23:00', multiplier: 0.7 },
      { start: '09:00', end: '23:00', multiplier: 1.0 },
    ];

    const slots: VenueSlot[] = [];
    let slotId = venueId * 1000;

    // Daily slots for each day in the range
    const startMs = new Date(startDate + 'T00:00:00').getTime();
    const endMs   = new Date(endDate   + 'T00:00:00').getTime();
    const current = new Date(startDate + 'T00:00:00');

    while (current.getTime() <= endMs) {
      const dateStr = this.toIso(current);
      const day = current.getDate();
      dailyTemplates.forEach((t, i) => {
        slotId++;
        slots.push({
          id: slotId,
          venueId,
          date: dateStr,
          startTime: t.start,
          endTime: t.end,
          price: Math.round((venue.price * t.multiplier) / 100) * 100,
          available: (day + venueId + i) % 4 !== 0,
          slotType: 'fixed',
        });
      });
      current.setDate(current.getDate() + 1);
    }

    // Multi-day packages (only when range spans 2+ days)
    const daysDiff = Math.round((endMs - startMs) / 86400000) + 1;

    if (daysDiff >= 2) {
      const day2 = new Date(startDate + 'T00:00:00');
      day2.setDate(day2.getDate() + 1);
      slotId++;
      slots.push({
        id: slotId,
        venueId,
        date: startDate,
        endDate: this.toIso(day2),
        startTime: '09:00',
        endTime: '22:00',
        price: Math.round((venue.price * 1.8) / 100) * 100,
        available: (new Date(startDate + 'T00:00:00').getDate() + venueId) % 3 !== 0,
        slotType: 'multiday',
        durationDays: 2,
      });
    }

    if (daysDiff >= 3) {
      slotId++;
      slots.push({
        id: slotId,
        venueId,
        date: startDate,
        endDate: endDate,
        startTime: '09:00',
        endTime: '22:00',
        price: Math.round((venue.price * daysDiff * 0.85) / 100) * 100,
        available: true,
        slotType: 'multiday',
        durationDays: daysDiff,
      });
    }

    return of(slots);
  }

  private toIso(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  createVenue(venueData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}venue`, venueData, { responseType: 'text' });
  }

  createSlot(venueId: number, slotData: any, dryRun: boolean): Observable<any> {
    const params = new HttpParams().set('dryRun', String(dryRun));
    return this.http.post(`${this.baseUrl}venue/${venueId}/slot`, slotData, { params, responseType: 'text' });
  }

  uploadImages(venueId: number, images: File[], profileIndex: number): Observable<any> {

    const formData = new FormData();

    images.forEach(file => {
      formData.append('images', file);
    });

    formData.append('profileIndex', profileIndex.toString());

    return this.http.post(
    `${this.baseUrl}venue/${venueId}/images`,
    formData,
    { responseType: 'text' }
    );
  }
}
