import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsEnum, MinLength, MaxLength } from 'class-validator';
import { BillingCycle } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty({ message: 'Plan name is required' })
  @MinLength(2, { message: 'Plan name must be at least 2 characters' })
  @MaxLength(100, { message: 'Plan name must not exceed 100 characters' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsNumber()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @Max(999999.99, { message: 'Price must not exceed 999999.99' })
  price: number;

  @IsString()
  @IsOptional()
  @MaxLength(10, { message: 'Currency must not exceed 10 characters' })
  currency?: string;

  @IsEnum(BillingCycle, { message: 'Billing cycle must be one of: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL' })
  @IsOptional()
  billingCycle?: BillingCycle;
}