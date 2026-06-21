import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../shared/models/user';

@Injectable({
  providedIn: 'root',
})
export class Authservice {

  loggedIn = signal(false);
  currentUser = signal<User | null>(null);

  private baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient) {
    this.checkAuth();
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(
      `${this.baseUrl}login`,
      { email, password }
    ).pipe(
      tap((response: any) => {
        localStorage.setItem('auth-token', response.token);
        localStorage.setItem('current-user', JSON.stringify(response));

        this.loggedIn.set(true);
        this.currentUser.set(response);
      })
    );
  }

  logout(): void {
    this.loggedIn.set(false);
    this.currentUser.set(null);

    localStorage.removeItem('auth-token');
    localStorage.removeItem('current-user');
  }

  checkAuth(): void {
    const token = localStorage.getItem('auth-token');
    const user = localStorage.getItem('current-user');

    this.loggedIn.set(!!token);

    if (user) {
      this.currentUser.set(JSON.parse(user));
    }
  }

  updateProfile(user: User): void {
    this.currentUser.set(user);
    localStorage.setItem('current-user', JSON.stringify(user));
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
