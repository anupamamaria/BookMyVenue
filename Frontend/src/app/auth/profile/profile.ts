import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Authservice } from '../authservice';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user: User = {
    name: '',
    email: '',
    location: '',
    token: '',
    role: 'USER'
  };

  constructor(
    private authService: Authservice,
    private dialogRef: MatDialogRef<Profile>
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUser;
    if (currentUser) {
      this.user = { ...currentUser };
    }
  }

  onSave(): void {
    this.authService.updateProfile(this.user);
    this.dialogRef.close();
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
