import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, firstValueFrom, Observable, tap  } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  private loggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedIn.asObservable();
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) {}

  get isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get role(): string | undefined {
    return this.currentUserSubject.value?.role;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(
      `${this.baseUrl}login`,
      { email, password }
    ).pipe(
      tap(response => {

        localStorage.setItem('auth-token', response.token);

        localStorage.setItem(
          'current-user',
          JSON.stringify(response)
        );

        this.loggedIn.next(true);
        this.currentUserSubject.next(response);
      })
    );
  }

  logout(): void {
    this.loggedIn.next(false);
    this.currentUserSubject.next(null);
    
    localStorage.removeItem('auth-token');
    localStorage.removeItem('current-user');
  }

  checkAuth(): void {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('current-user');

    this.loggedIn.next(!!token);

    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  updateProfile(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }
  
  signup(role: 'USER' | 'VENUE_OWNER', signupForm: FormGroup): Observable<any> {
    // Simulate signup logic
    const { name, email, mobile, location, password } = signupForm.value;
    const signupRequest = {
      name,
      email,
      mobile,
      location,
      password,
      role
    };
    
    return this.http.post(`${this.baseUrl}signup`, signupRequest, { responseType: 'text'});
  }
}
