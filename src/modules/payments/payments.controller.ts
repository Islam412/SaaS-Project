import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  create(@GetUser('tenantId') tenantId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(tenantId, dto);
  }

  @Get()
  findAll(@GetUser('tenantId') tenantId: string) {
    return this.paymentsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@GetUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.paymentsService.findOne(tenantId, id);
  }
}
