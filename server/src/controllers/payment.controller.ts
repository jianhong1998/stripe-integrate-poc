import {
    Body,
    Controller,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CURRENCY } from 'src/constants';
import { GetAllPaymentsResponse } from 'src/models/paymentResponse.model';
import { PaymentService } from 'src/services/payment/payment.service';
import { IPaymentItem } from 'src/types/paymentItem.dto';
import Stripe from 'stripe';

@Controller('/payment')
@ApiTags('Payment')
export class PaymentController {
    @Get('/')
    @ApiOkResponse({
        description: 'Successfully get all payment sessions',
        type: GetAllPaymentsResponse,
    })
    async getAllPaymentDetails() {
        return { sessions: await PaymentService.getPayments() };
    }

    @Get('/refun')
    async getAllRefunded() {
        return PaymentService.getRefundedPayments();
    }

    @Post('/')
    @HttpCode(303)
    async createPayment() {
        const items: IPaymentItem[] = [
            {
                price_data: {
                    currency: CURRENCY,
                    product_data: {
                        name: 'Cleaning Fee',
                    },
                    unit_amount: 10 * 100,
                },
                quantity: 1,
            },
            {
                price_data: {
                    currency: CURRENCY,
                    product_data: {
                        name: 'BBQ Booking Fee',
                    },
                    unit_amount: 20 * 100,
                },
                quantity: 2,
            },
        ];

        const session = await PaymentService.createPaymentSession(items);

        return {
            sessionUrl: session.url,
        };
    }

    @Post('/:id/refund')
    async createRefund(@Param('id') id: string) {
        const session = await PaymentService.getCheckoutSession(id);

        if (!session) {
            throw new NotFoundException(`Payment session ${id} is not found.`);
        }

        let paymentIntentId = '';

        if (typeof session.payment_intent === 'string') {
            paymentIntentId = session.payment_intent;
        } else {
            paymentIntentId = session.payment_intent.id;
        }

        const refund = await PaymentService.createRefund(paymentIntentId);

        return refund;
    }

    @Post('/webhook')
    @HttpCode(200)
    async handleWebhook(@Body() body: Stripe.Event) {
        const message = await PaymentService.handleWebhook(body);

        return { message };
    }
}
