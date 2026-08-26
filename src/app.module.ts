import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { validateEnv } from './config/env.validation';
import { TicketsModule } from './tickets/tickets.module';
import { Ticket } from './tickets/entities/ticket.entity';
import { AppController } from './app.controller';
import { MarketingModule } from './marketing/marketing.module';
import { RedSocialMetrica } from './marketing/entities/red-social-metrica.entity';
import { AnuncioMetrica } from './marketing/entities/anuncio-metrica.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.getOrThrow<string>('DB_HOST'),
        port: Number(configService.getOrThrow('DB_PORT')),
        username: configService.getOrThrow<string>('DB_USERNAME'),
        password: configService.getOrThrow<string>('DB_PASSWORD'),
        database: configService.getOrThrow<string>('DB_DATABASE'),
        entities: [Ticket, RedSocialMetrica, AnuncioMetrica],
        synchronize: false,
        ssl:
          configService.get('DB_SSL') === 'true'
            ? {
                // Certificados autofirmados en MySQL remoto: cifrado sí, CA estricta no.
                rejectUnauthorized:
                  configService.get('DB_SSL_REJECT_UNAUTHORIZED') === 'true',
              }
            : undefined,
      }),
    }),
    AuthModule,
    TicketsModule,
    MarketingModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
