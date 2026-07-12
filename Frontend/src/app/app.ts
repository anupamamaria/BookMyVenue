import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PaymentService } from './shared/payment';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,MatSnackBarModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('BookMyVenue');
  
  constructor(private paymentService: PaymentService, private snackBar: MatSnackBar) {}
  
}
