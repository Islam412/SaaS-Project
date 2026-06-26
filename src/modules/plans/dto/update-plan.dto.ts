import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @IsOptional()
  isActive?: boolean;
}
