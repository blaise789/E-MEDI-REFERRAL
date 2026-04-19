import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate a user with email and password. Returns a JWT access token.',
  })
  @ApiResponse({ status: 200, description: 'Login successful. Returns access_token and user payload.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.accountsService.login(loginDto);
  }

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new account. Default role is CLINICIAN. Users can be assigned to hospitals after creation.',
  })
  @ApiResponse({ status: 201, description: 'Registration successful. Returns access_token and user payload.' })
  @ApiResponse({ status: 409, description: 'User with this email already exists.' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.accountsService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the authenticated user profile details including role and hospital assignment.',
  })
  @ApiResponse({ status: 200, description: 'User profile returned.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.accountsService.getProfile(req.user.id);
  }
}
