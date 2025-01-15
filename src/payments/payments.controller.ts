import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-payment-session')
  createPaymentSession(@Body() paymentSession: PaymentSessionDto) {
    // return paymentSession;
    return this.paymentsService.createPaymentSession(paymentSession);
  }

  @Get('success')
  getPaymentSuccess() {
    return {
      ok: true,
      msg: 'getPaymentSuccess'
    };
  }

  @Get('cancelled')
  getPaymentCancelled() {
    return {
      ok: false,
      msg: 'getPaymentCancelled'
    };
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    return this.paymentsService.stripeWebhook(req, res);
  }

}
