export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'free' | 'basic' | 'premium' | 'yearly';
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  isPopular: boolean;
  maxExamsPerDay: number;
  hasDetailedAnalytics: boolean;
  hasOfflineAccess: boolean;
  hasPrioritySupport: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planType: 'free' | 'basic' | 'premium' | 'yearly';
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  method: 'payme' | 'click' | 'stripe';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface SubscribeRequest {
  planId: string;
  paymentMethod: 'payme' | 'click' | 'stripe';
  autoRenew: boolean;
}

export interface PaymentInitResponse {
  paymentUrl: string;
  transactionId: string;
}
