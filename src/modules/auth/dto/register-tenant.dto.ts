import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @MinLength(2, { message: 'Company name must be at least 2 characters' })
  @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Address must not exceed 200 characters' })
  address?: string;
}