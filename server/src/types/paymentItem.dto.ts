import Stripe from 'stripe';

export type IPaymentItem = Stripe.Checkout.SessionCreateParams.LineItem;
