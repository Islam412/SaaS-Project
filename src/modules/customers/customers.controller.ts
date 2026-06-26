import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Post()
  create(@GetUser('tenantId') tenantId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(tenantId, dto);
  }

  @Get()
  findAll(@GetUser('tenantId') tenantId: string) {
    return this.customersService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@GetUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.customersService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@GetUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.customersService.remove(tenantId, id);
  }
}
