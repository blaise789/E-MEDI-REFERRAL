import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CaslAbilityFactory, Action } from '../casl/casl-ability.factory';
import { Role, User } from '@prisma/client';
import { subject } from '@casl/ability';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async create(dto: CreateUserDto, authenticatedUser: User) {
    const ability = this.caslAbilityFactory.createForUser(authenticatedUser as any);
    if (!ability.can(Action.Create, 'User')) {
      throw new ForbiddenException('You do not have permission to create users');
    }

    // Role safety: Only SysAdmin can create SysAdmin
    if (dto.role === Role.SYS_ADMIN && authenticatedUser.role !== Role.SYS_ADMIN) {
      throw new ForbiddenException('Only System Administrators can create other SysAdmins');
    }

    // Hospital safety: Only SysAdmin can assign any hospital.
    // Hospital Admin can only create users for their own hospital.
    if (authenticatedUser.role === Role.HOSPITAL_ADMIN) {
      if (dto.hospitalId !== authenticatedUser.hospitalId) {
        throw new ForbiddenException('Hospital Admins can only create users for their own hospital');
      }
    }

    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ForbiddenException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      include: {
        hospital: true,
      },
    });
  }

  async findAll(authenticatedUser: User) {
    const ability = this.caslAbilityFactory.createForUser(authenticatedUser as any);
    
    // If Admin, they can potentially see all. If Hospital Admin, they see their facility.
    // We'll filter the query based on the role for performance, and rely on CASL for fine-grained check.
    const where: any = {};
    if (authenticatedUser.role === Role.HOSPITAL_ADMIN) {
      where.hospitalId = authenticatedUser.hospitalId;
    } else if (authenticatedUser.role !== Role.SYS_ADMIN) {
      // Non-admins can't list users
      throw new ForbiddenException('Only administrators can list users');
    }

    return this.prisma.user.findMany({
      where,
      include: {
        hospital: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, authenticatedUser: User) {
    const userToView = await this.prisma.user.findUnique({
      where: { id },
      include: { hospital: true },
    });

    if (!userToView) {
      throw new NotFoundException('User not found');
    }

    const ability = this.caslAbilityFactory.createForUser(authenticatedUser as any);
    if (!ability.can(Action.Read, subject('User', userToView as any))) {
      throw new ForbiddenException('You do not have permission to view this user');
    }

    return userToView;
  }

  async update(id: string, dto: UpdateUserDto, authenticatedUser: User) {
    const userToUpdate = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    const ability = this.caslAbilityFactory.createForUser(authenticatedUser as any);
    if (!ability.can(Action.Update, subject('User', userToUpdate as any))) {
      throw new ForbiddenException('You do not have permission to update this user');
    }

    // Role safety: Only SysAdmin can promote to SysAdmin
    if (dto.role === Role.SYS_ADMIN && authenticatedUser.role !== Role.SYS_ADMIN) {
      throw new ForbiddenException('Only System Administrators can grant SYS_ADMIN role');
    }

    // Hospital safety: Only SysAdmin can change hospital assignments
    if (dto.hospitalId && authenticatedUser.role !== Role.SYS_ADMIN) {
      if (dto.hospitalId !== authenticatedUser.hospitalId) {
        throw new ForbiddenException('Hospital Admins can only assign users within their own hospital');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: dto,
      include: { hospital: true },
    });
  }

  async delete(id: string, authenticatedUser: User) {
    const userToDelete = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    const ability = this.caslAbilityFactory.createForUser(authenticatedUser as any);
    if (!ability.can(Action.Delete, subject('User', userToDelete as any))) {
      throw new ForbiddenException('You do not have permission to delete this user');
    }

    // Prevent deleting self
    if (userToDelete.id === authenticatedUser.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
