import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { Authservice } from '../authservice';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  signupForm: FormGroup;
  errorMessage = '';
  loading = false;
  role: 'USER' | 'VENUE_OWNER' = 'USER';
  message = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<Signup>,
    private authService: Authservice,
    private cdr: ChangeDetectorRef
  ) {
    this.signupForm = this.buildForm();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      location: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onRoleChange(role: 'USER' | 'VENUE_OWNER'): void {
    this.role = role;
    this.errorMessage = '';
    this.signupForm = this.buildForm();
  }

  get passwordMismatch(): boolean {
    const pw = this.signupForm.get('password')?.value;
    const cpw = this.signupForm.get('confirmPassword')?.value;
    return cpw && pw !== cpw;
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid || this.passwordMismatch) return;
    this.loading = true;
    this.errorMessage = '';
    try {
      const response = await firstValueFrom(
        this.authService.signup(this.role, this.signupForm)
      );
      if (response === 'user Registration Successful')
      {
        this.message = 'Signup successful! Please log in.';
        this.signupForm.reset();
      }
    } 
    catch (error: any) {
      console.error(error);
      this.errorMessage = 'Signup failed';
    } 
    finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  switchToLogin(): void {
    this.dialogRef.close({
      action: 'login'
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
