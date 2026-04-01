import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { OtpType } from '../common/constants/otp-type.enum';
import { generateOtp } from '../common/utils/otp.util';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async createOtp(email: string, type: OtpType, expiresMinutes: number): Promise<string> {
    const code = generateOtp(6);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    await this.otpRepository.update(
      { email, type, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );

    const otp = this.otpRepository.create({
      email,
      code,
      type,
      expiresAt,
      consumedAt: null,
    });

    await this.otpRepository.save(otp);
    return code;
  }

  async validateAndConsume(email: string, code: string, type: OtpType): Promise<void> {
    const otp = await this.otpRepository.findOne({
      where: { email, code, type, consumedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired');
    }

    otp.consumedAt = new Date();
    await this.otpRepository.save(otp);
  }

  async validateOnly(email: string, code: string, type: OtpType): Promise<void> {
    const otp = await this.otpRepository.findOne({
      where: { email, code, type, consumedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired');
    }
  }
}
