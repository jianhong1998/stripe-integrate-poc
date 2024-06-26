import { ApiProperty } from '@nestjs/swagger';
import Stripe from 'stripe';

export class GetAllPaymentsResponse {
    @ApiProperty()
    sessions: Stripe.Checkout.Session[];
}
