import { Component, OnInit, ElementRef, HostListener, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Authservice } from '../../auth/authservice';
import { User } from '../models/user';
import { Login } from '../../auth/login/login';
import { Signup } from '../../auth/signup/signup';
import { Profile } from '../../auth/profile/profile';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink,FormsModule, MatSelectModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  @Input() mode: 'default' | 'venue-filters' = 'default';
  @Input() locations: string[] = [];
  @Input() filterLocation = '';
  @Input() filterType = '';
  @Input() filterStatus = '';
  @Input() totalElements = 0;
  @Input() hasActiveFilters = false;

  
  @Output() filtersCleared = new EventEmitter<void>();
  @Output() searchClicked = new EventEmitter<{ location: string; type: string; status: string }>();
  showUserMenu = false;
  venueTypes = [
    { value: 'auditorium',     label: 'Auditorium' },
    { value: 'exhibitionHall', label: 'Exhibition Hall' },
    { value: 'cafe',           label: 'Cafe' },
  ];
  statuses: string[] = ['PENDING', 'APPROVED', 'REJECTED'];

  constructor(
    private authService: Authservice,
    private el: ElementRef,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  }

  get isLoggedIn(): boolean {
    return this.authService.loggedIn();
  }

  get currentUser(): User | null {
    return this.authService.currentUser();
  }
  get homeRoute(): string {
    const role = this.authService.currentUser()?.role;

    switch (role) {
      case 'VENUE_OWNER':
        return '/venues';

      case 'ADMIN':
        return '/admin';

      default:
        return '/';
    }
  }
  toggleUserMenu(): void { this.showUserMenu = !this.showUserMenu; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const userMenu = this.el.nativeElement.querySelector('.nav-user');
    if (this.showUserMenu && userMenu && !userMenu.contains(event.target as Node)) {
      this.showUserMenu = false;
    }
  }

  onSearchClick(): void {
    this.searchClicked.emit({
      location: this.filterLocation,
      type: this.filterType,
      status: this.filterStatus
    });
  }

  

  onClearFilters(): void {
    this.filterLocation = '';
    this.filterType = '';
    this.filterStatus = '';
    this.filtersCleared.emit();
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  openLoginDialog(): void {
    this.showUserMenu = false;
    const ref = this.dialog.open(Login, { width: '420px', panelClass: 'auth-dialog' });
    ref.afterClosed().subscribe(result => { 
      console.log('Login dialog closed with result:', result);
      if (result?.action === 'signup') 
        this.openSignupDialog(); 
      if(result?.action === 'login-success') {
        //check the role of the user and navigate accordingly
        if(result.user.role === 'VENUE_OWNER') {
          this.router.navigate(['/venues']);
        } else {
          this.router.navigate(['/']);
        }
      }
    });
  }

  openSignupDialog(): void {
    this.showUserMenu = false;
    const ref = this.dialog.open(Signup, { width: '480px', panelClass: 'auth-dialog' });
    ref.afterClosed().subscribe(result => { if (result?.action === 'login') this.openLoginDialog(); });
  }

  openProfileDialog(): void {
    this.showUserMenu = false;
    this.dialog.open(Profile, { width: '500px', panelClass: 'auth-dialog' });
  }

  get userInitials(): string {
    if (!this.currentUser?.name) return '?';
    const parts = this.currentUser.name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : this.currentUser.name.slice(0, 2).toUpperCase();
  }

  get avatarColor(): string {
    const colors = ['#e8604c','#5c6bc0','#26a69a','#ff7043','#42a5f5','#ab47bc','#66bb6a','#ffa726'];
    const name = this.currentUser?.name ?? '';
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
