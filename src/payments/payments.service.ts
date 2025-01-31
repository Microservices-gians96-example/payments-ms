import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs, NATS_SERVERS } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import e, { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
    private readonly stripe = new Stripe(envs.STRIPE_SECRET_KEY);
    private readonly logger = new Logger('PaymentsService');

    constructor(@Inject(NATS_SERVERS) private readonly client: ClientProxy) { }

    async createPaymentSession(paymentSession: PaymentSessionDto) {
        const { currency, items, orderId } = paymentSession;
        const lineItems = items.map(item => {
            return {
                price_data: {
                    currency: currency,
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.round(item.price * 100), //20 dolares
                },
                quantity: item.quantity,
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            //colocar el ID de la orden
            payment_intent_data: {
                metadata: {
                    orderId
                }
            },
            line_items: lineItems,
            // line_items: [
            //     {
            //         price_data: {
            //             currency: currency,
            //             product_data: {
            //                 name: 'T-shirt',
            //             },
            //             unit_amount: 2000, //20 dolares
            //         },
            //         quantity: 2, 
            //     }
            // ],
            mode: 'payment',// payment, setup, subscription
            success_url: envs.STRIPE_SUCCESS_URL,
            cancel_url: envs.STRIPE_CANCEL_URL,
        })
        // return session;
        return {
            cancelUrl: session.cancel_url,
            successUrl: session.success_url,
            url: session.url,
        }

    }
    async stripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'];
        let event: Stripe.Event;
        const endpointSecret = envs.STRIPE_ENDPOINT_SECRET;

        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret);
        } catch (err) {
            console.log(err);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // Handle the event
        switch (event.type) {
            case 'charge.succeeded':
                const chargeSucceeded = event.data.object;
                const payload = {
                    stripePaymentId: chargeSucceeded.id,
                    orderId: chargeSucceeded.metadata.orderId,
                    receipUrl: chargeSucceeded.receipt_url,
                };

                // this.logger.log(`Payment succeeded: ${JSON.stringify(payload)}`);
                this.client.emit('payment-succeeded', payload);
                break;
            // ... handle other event types
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        return res.status(200).json(sig);
    }
}
