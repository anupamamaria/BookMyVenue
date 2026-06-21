import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Authservice } from '../../auth/authservice';
import { SearchService } from '../search.service';
import { User } from '../models/user';
import { Login } from '../../auth/login/login';
import { Signup } from '../../auth/signup/signup';
import { Profile } from '../../auth/profile/profile';

@Component({
  selector: 'app-navbar-home',
  imports: [CommonModule, RouterLink, FormsModule, MatCheckboxModule],
  templateUrl: './navbar-home.html',
  styleUrl: './navbar-home.scss',
})
export class NavbarHome implements OnInit {
  showUserMenu = false;
  isLoggedIn = false;
  currentUser: User | null = null;

  constructor(
    public search: SearchService,
    private authService: Authservice,
    private el: ElementRef,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(val => this.isLoggedIn = val);
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  toggleUserMenu(): void { this.showUserMenu = !this.showUserMenu; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const userMenu = this.el.nativeElement.querySelector('.nav-user');
    if (this.showUserMenu && userMenu && !userMenu.contains(event.target as Node)) {
      this.showUserMenu = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }

  openLoginDialog(): void {
    this.showUserMenu = false;
    const ref = this.dialog.open(Login, { width: '420px', panelClass: 'auth-dialog' });
    ref.afterClosed().subscribe(r => { if (r === 'signup') this.openSignupDialog(); });
  }

  openSignupDialog(): void {
    this.showUserMenu = false;
    const ref = this.dialog.open(Signup, { width: '480px', panelClass: 'auth-dialog' });
    ref.afterClosed().subscribe(r => { if (r === 'login') this.openLoginDialog(); });
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

