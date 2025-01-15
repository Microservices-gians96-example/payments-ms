import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
