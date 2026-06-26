import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
import { AccountType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerTenant(dto: RegisterTenantDto) {
    // Check if tenant email already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { email: dto.email },
    });

    if (existingTenant) {
      throw new ConflictException('Tenant with this email already exists');
    }

    // Check if user email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create tenant and admin user in a transaction
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: dto.name,
          email: dto.email,
          phone: dto.phone,
          address: dto.address,
        },
      });

      // Create admin user
      const user = await prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: 'ADMIN',
          tenantId: tenant.id,
        },
      });

      // Create default accounts for the tenant (Chart of Accounts)
      const accountData: { code: string; name: string; type: AccountType }[] = [
        { code: '1000', name: 'Cash', type: AccountType.ASSET },
        { code: '1100', name: 'Accounts Receivable', type: AccountType.ASSET },
        { code: '2000', name: 'Deferred Revenue', type: AccountType.LIABILITY },
        { code: '4000', name: 'Subscription Revenue', type: AccountType.REVENUE },
      ];

      for (const acc of accountData) {
        await prisma.account.upsert({
          where: {
            code: acc.code,
          },
          update: {},
          create: {
            code: acc.code,
            name: acc.name,
            type: acc.type,
            balance: 0,
            tenantId: tenant.id,
          },
        });
      }

      return { tenant, user };
    });

    // Generate JWT token
    const token = this.generateToken(result.user);

    return {
      access_token: token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.user.tenantId,
      },
    };
  }

  async login(dto: LoginDto) {
    // Find user with tenant
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
    return this.jwtService.sign(payload);
  }
}