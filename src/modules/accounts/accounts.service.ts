import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: loginDto.email },
      include: {
        hospital: {
          select: {
            name: true,
            level: true,
            location: true,
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        ...payload,
        firstName: user.firstName,
        lastName: user.lastName,
        telephone: user.telephone,
        hospital: user.hospital,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: 'CLINICIAN', // default role
      },
    });

    const payload = { id: user.id, email: user.email, role: user.role, hospitalId: user.hospitalId };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        hospitalId: true,
        telephone: true,
        createdAt: true,
        hospital: {
          select: {
            name: true,
            level: true,
            location: true,
          },
        },
      },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
