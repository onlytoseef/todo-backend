import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';
import { OtpService } from '../otp/otp.service';
import { OtpType } from '../common/constants/otp-type.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  private getOtpExpiryMinutes(): number {
    return Number(this.configService.get<string>('OTP_EXPIRES_MINUTES', '10'));
  }

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing && existing.isVerified) {
      throw new BadRequestException('Email already registered');
    }

    let user = existing;
    const passwordHash = await bcrypt.hash(dto.password, 10);

    if (!user) {
      user = await this.usersService.create(dto.email, passwordHash);
    } else {
      await this.usersService.updatePassword(user.id, passwordHash);
    }

    const otp = await this.otpService.createOtp(
      dto.email,
      OtpType.VERIFY_EMAIL,
      this.getOtpExpiryMinutes(),
    );

    await this.mailService.sendOtp(dto.email, otp, 'email verification');

    return { message: 'Signup successful. OTP sent to email.' };
  }

  async verifySignupOtp(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.otpService.validateAndConsume(dto.email, dto.otp, OtpType.VERIFY_EMAIL);
    await this.usersService.markVerified(user.id);

    return { message: 'User verified successfully.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('User not verified');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      return { message: 'If this email exists, OTP has been sent.' };
    }

    const otp = await this.otpService.createOtp(
      dto.email,
      OtpType.RESET_PASSWORD,
      this.getOtpExpiryMinutes(),
    );
    await this.mailService.sendOtp(dto.email, otp, 'password reset');

    return { message: 'If this email exists, OTP has been sent.' };
  }

  async verifyResetOtp(dto: VerifyOtpDto) {
    await this.otpService.validateOnly(dto.email, dto.otp, OtpType.RESET_PASSWORD);
    return { message: 'OTP verified. You can now reset password.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.otpService.validateAndConsume(dto.email, dto.otp, OtpType.RESET_PASSWORD);

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.updatePassword(user.id, passwordHash);

    return { message: 'Password reset successful.' };
  }
}
