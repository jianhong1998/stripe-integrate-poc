import { Injectable } from '@nestjs/common';
import { CLIENT_URL } from 'src/constants';
import { IPaymentItem } from 'src/types/paymentItem.dto';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private static readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    private static payments: Stripe.Checkout.Session[] = [];
    private static successPaymentMap = new Map<
        string,
        Stripe.Checkout.Session
    >();
    private static refund: Stripe.Refund[] = [];

    static async createPaymentSession(items: IPaymentItem[]) {
        return await this.stripe.checkout.sessions.create(
            {
                payment_method_types: ['paynow'],
                line_items: items,
                mode: 'payment',
                success_url: `${CLIENT_URL}/pay/success`,
                cancel_url: `${CLIENT_URL}/pay/cancelled`,
                customer_email: 'resident@test.com',
            },
            {
                apiKey: process.env.STRIPE_SECRET_KEY,
            },
        );
    }

    static async getPayments() {
        return this.payments;
    }

    static async getCheckoutSession(
        id: string,
    ): Promise<Stripe.Checkout.Session | undefined> {
        return this.successPaymentMap.get(id);
    }

    static async getRefundedPayments() {
        return this.refund;
    }

    static async confirmPayment(session: Stripe.Checkout.Session) {
        this.payments.push(session);
        this.successPaymentMap.set(session.id, session);
    }

    static async createRefund(paymentIntentId: string) {
        const refund = await this.stripe.refunds.create(
            {
                payment_intent: paymentIntentId,
            },
            {
                apiKey: process.env.STRIPE_SECRET_KEY,
            },
        );

        return refund;
    }

    static async handleWebhook(payload: Stripe.Event) {
        switch (payload.type) {
            case 'checkout.session.async_payment_succeeded':
                const checkoutSession = payload.data.object;
                await this.confirmPayment(checkoutSession);
                break;
            case 'checkout.session.async_payment_failed':
                break;
            // case 'charge.refunded':
            //     payload.data.object.refunded;
            //     break;
            case 'charge.refund.updated':
                const refund = payload.data.object;
                this.refund.push(refund);
                break;
            default:
                console.log({ type: payload.type, data: payload.data.object });
                break;
        }

        return 'ok';
    }
}
