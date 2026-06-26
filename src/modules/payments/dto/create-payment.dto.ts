import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsEnum, IsDateString, IsUUID, MaxLength } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsUUID(4, { message: 'Invalid invoice ID format' })
  @IsNotEmpty({ message: 'Invoice ID is required' })
  invoiceId: string;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Max(999999.99, { message: 'Amount must not exceed 999999.99' })
  amount: number;

  @IsEnum(PaymentMethod, { message: 'Method must be one of: CASH, BANK_TRANSFER, CREDIT_CARD, PAYPAL, OTHER' })
  @IsOptional()
  method?: PaymentMethod;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Reference must not exceed 100 characters' })
  reference?: string;

  @IsDateString({}, { message: 'Payment date must be a valid ISO date string' })
  @IsOptional()
  paymentDate?: string;
}