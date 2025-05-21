import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { LoginUserDto } from './dto/user-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Response, Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../shared/types/environment.type';
import { GetUserDto } from '../users/dto/get-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private usersService: UsersService
  ) {}

  // Routing
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')

  // Swagger Documentation
  @ApiOperation({
    summary: 'Login a user and receive tokens',
    description: `Logs in a user using username and password. 
  Returns an access token in the response body and sets a refresh token as a HttpOnly cookie.`,
  })
  @ApiResponse({
    status: 200,
    description:
      'Access token returned in body. Refresh token set as HttpOnly cookie.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.authService.login(
      loginDto.username,
      loginDto.password,
    );

    response.cookie('refresh_token', loginResponse.tokens.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<Environment>('ENV') === 'DEV',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { access_token: loginResponse.tokens.access_token, userId: loginResponse.userId  };
  }

  // Routing
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)

  // Swagger Documentation
  @ApiCookieAuth('refresh_token')
  @ApiOperation({
    summary: 'Refresh access token',
    description: `Requires a valid refresh token stored in an HttpOnly cookie.
  Returns a new access token and rotates the refresh token.`,
  })
  @ApiResponse({
    status: 200,
    description:
      'New access token returned in body. New refresh token set as cookie.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Refresh token is missing or invalid',
  })
  async refresh(
    @GetCurrentUser('sub') userId: number,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new ForbiddenException('Refresh token cookie missing');
    }

    const refreshResponse = await this.authService.refreshTokens(userId, refreshToken);

    response.cookie('refresh_token', refreshResponse.tokens.refresh_token, {
      httpOnly: true,
      secure: this.configService.get<Environment>('ENV') === 'DEV',
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { access_token: refreshResponse.tokens.access_token, userId: refreshResponse.userId };
  }

  // Routing
  @Post('register')
  @HttpCode(HttpStatus.CREATED)

  // Swagger Documentation
  @ApiOperation({ summary: 'Create a new User' })
  @ApiResponse({
    status: 200,
    description:
      'returns the created user data',
    type: GetUserDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict',
  })
  async insertUser(@Body() createUser: CreateUserDto) {
    const createdUser = await this.usersService.insertUser(createUser);
    return new GetUserDto(createdUser);
  }
}
