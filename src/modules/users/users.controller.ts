import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PoliciesGuard } from '../../guards/policies.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard, PoliciesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @Roles(Role.SYS_ADMIN, Role.HOSPITAL_ADMIN)
  @Post()
  create(@Body() dto: CreateUserDto, @Req() req) {
    return this.usersService.create(dto, req.user);
  }

  @ApiOperation({ summary: 'List all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of users returned.' })
  @Roles(Role.SYS_ADMIN, Role.HOSPITAL_ADMIN)
  @Get()
  findAll(@Req() req) {
    return this.usersService.findAll(req.user);
  }

  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'User data returned.' })
  @Roles(Role.SYS_ADMIN, Role.HOSPITAL_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.usersService.findOne(id, req.user);
  }

  @ApiOperation({ summary: 'Update user role or hospital' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @Roles(Role.SYS_ADMIN, Role.HOSPITAL_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req) {
    return this.usersService.update(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Remove user access' })
  @ApiResponse({ status: 200, description: 'User deleted.' })
  @Roles(Role.SYS_ADMIN, Role.HOSPITAL_ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.usersService.delete(id, req.user);
  }
}
