import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsDateString, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID(4, { message: 'Invalid subscription ID format' })
  @IsNotEmpty({ message: 'Subscription ID is required' })
  subscriptionId: string;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  @Max(999999.99, { message: 'Amount must not exceed 999999.99' })
  amount: number;

  @IsNumber()
  @Min(0, { message: 'Tax must be greater than or equal to 0' })
  @Max(100, { message: 'Tax must not exceed 100%' })
  @IsOptional()
  tax?: number;

  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  @IsOptional()
  dueDate?: string;
}