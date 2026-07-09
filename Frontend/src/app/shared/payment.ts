import { Injectable } from '@angular/core';
import { OrderRequestDTO, RazorPayment } from './models/booking';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Authservice } from '../auth/authservice';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly baseUrl = 'http://localhost:8080/';

  constructor(private http: HttpClient, private authService: Authservice) { }

  createOrderForPayment(orderRequest: OrderRequestDTO): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}payments/orders`, orderRequest);
  }

  verifyPayment(paymentResponse: any): Observable<any> {
    return this.http.post(`${this.baseUrl}payments/verify`, paymentResponse, { responseType: 'text' });
  }

  payNow(orderId: string): Observable<any> {
    return new Observable(observer => {

      const options = {
        key: RazorPayment.razorpayKey,
        name: 'Book My Venue',
        description: 'Payment for booking',
        order_id: orderId,
        retry: { enabled: false },
        handler: (response: any) => {
          observer.next(response);
          observer.complete();
        },
        modal: {
          ondismiss: () => {
            // fires if the user closes the modal manually (cancel, or after a failure with retry disabled)
            observer.error({ reason: 'dismissed' });
          }
        },
        prefill: {
          name: this.authService.currentUser()!.name || '',
          email: this.authService.currentUser()!.email || 'john@example.com',
          contact: '9876543210'
        },

        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new Razorpay(options);

      rzp.on('payment.failed', (response: any) => {
        observer.error(response);
      });

      rzp.open();
    });
  }
}