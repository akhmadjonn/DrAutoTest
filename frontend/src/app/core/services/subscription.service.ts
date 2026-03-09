import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  SubscriptionPlan,
  Subscription,
  SubscribeRequest,
  PaymentInitResponse,
  Payment,
} from '../models/subscription.model';
import { ApiResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private api: ApiService) {}

  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.api.get<ApiResponse<SubscriptionPlan[]>>('/subscriptions/plans');
  }

  getCurrentSubscription(): Observable<ApiResponse<Subscription>> {
    return this.api.get<ApiResponse<Subscription>>('/subscriptions/current');
  }

  subscribe(request: SubscribeRequest): Observable<ApiResponse<PaymentInitResponse>> {
    return this.api.post<ApiResponse<PaymentInitResponse>>('/subscriptions/subscribe', request);
  }

  cancelSubscription(): Observable<ApiResponse<{ message: string }>> {
    return this.api.post<ApiResponse<{ message: string }>>('/subscriptions/cancel');
  }

  getPaymentHistory(): Observable<ApiResponse<Payment[]>> {
    return this.api.get<ApiResponse<Payment[]>>('/subscriptions/payments');
  }

  verifyPayment(transactionId: string): Observable<ApiResponse<Subscription>> {
    return this.api.post<ApiResponse<Subscription>>('/subscriptions/verify-payment', { transactionId });
  }
}
