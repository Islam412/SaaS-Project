import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { SubscriptionStatus } from '@prisma/client';

export class CreateSubscriptionDto {
  @IsUUID(4, { message: 'Invalid customer ID format' })
  @IsNotEmpty({ message: 'Customer ID is required' })
  customerId: string;

  @IsUUID(4, { message: 'Invalid plan ID format' })
  @IsNotEmpty({ message: 'Plan ID is required' })
  planId: string;

  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  @IsOptional()
  startDate?: string;

  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  @IsOptional()
  endDate?: string;

  @IsEnum(SubscriptionStatus, { message: 'Status must be one of: ACTIVE, CANCELLED, EXPIRED, PAUSED' })
  @IsOptional()
  status?: SubscriptionStatus;

  @IsBoolean({ message: 'Auto renew must be a boolean' })
  @IsOptional()
  autoRenew?: boolean;
}