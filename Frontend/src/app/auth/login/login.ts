import { Component } from '@angular/core';
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
  loading = false;

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
    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;
    const response = await firstValueFrom(this.authService.login(email, password));
    this.loading = false;
    this.dialogRef.close({
      action: 'login-success',
      user: response
    });
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
