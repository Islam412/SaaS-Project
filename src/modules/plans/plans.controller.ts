import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Post()
  create(@GetUser('tenantId') tenantId: string, @Body() dto: CreatePlanDto) {
    return this.plansService.create(tenantId, dto);
  }

  @Get()
  findAll(@GetUser('tenantId') tenantId: string) {
    return this.plansService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@GetUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.plansService.findOne(tenantId, id);
  }

  @Put(':id')
  update(@GetUser('tenantId') tenantId: string, @Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(tenantId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.plansService.remove(tenantId, id);
  }
}
