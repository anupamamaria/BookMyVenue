import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Authservice } from '../authservice';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  errorMessage = '';
  loading = signal(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<Login>,
    private dialog: MatDialog,
    private authService: Authservice
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;
    
    this.loading.set(true);
    this.errorMessage = '';
    
    try {
      const { email, password } = this.loginForm.value;
    
      const response = await firstValueFrom(
        this.authService.login(email, password)
      );
    
      this.dialogRef.close({
        action: 'login-success',
        user: response
      });
    
    } catch (err: any) {
      this.errorMessage = 'Invalid email or password';
    } finally {
      this.loading.set(false);
    }
  }

  switchToSignup(): void {
    this.dialogRef.close({
      action: 'signup'
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
