import { Controller, Get, Post, Put, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Post()
  create(@GetUser('tenantId') tenantId: string, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(tenantId, dto);
  }

  @Get()
  findAll(@GetUser('tenantId') tenantId: string) {
    return this.invoicesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@GetUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.invoicesService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@GetUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(tenantId, id, dto);
  }

  @Post('generate-monthly')
  generateMonthly(@GetUser('tenantId') tenantId: string) {
    return this.invoicesService.generateMonthlyInvoices(tenantId);
  }

  @Patch(':id/sent')
  markAsSent(@GetUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.invoicesService.markAsSent(tenantId, id);
  }
}
