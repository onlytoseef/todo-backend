import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OtpModule } from './otp/otp.module';
import { TodoModule } from './todo/todo.module';
import { MailModule } from './mail/mail.module';
import { User } from './users/entities/user.entity';
import { Otp } from './otp/entities/otp.entity';
import { Todo } from './todo/entities/todo.entity';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'todo_app'),
        ssl:
          configService.get<string>('DB_SSL', 'false') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        entities: [User, Otp, Todo],
        synchronize: configService.get<string>('DB_SYNC', 'true') === 'true',
      }),
    }),
    UsersModule,
    OtpModule,
    MailModule,
    AuthModule,
    TodoModule,
    HealthModule,
  ],
})
export class AppModule {}
