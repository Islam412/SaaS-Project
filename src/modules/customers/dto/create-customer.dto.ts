import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Tax ID must not exceed 50 characters' })
  taxId?: string;
}