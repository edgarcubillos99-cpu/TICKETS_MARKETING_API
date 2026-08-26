import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnuncioMetrica } from './entities/anuncio-metrica.entity';
import { RedSocialMetrica } from './entities/red-social-metrica.entity';
import { MarketingController } from './marketing.controller';
import { MarketingService } from './marketing.service';

@Module({
  imports: [TypeOrmModule.forFeature([RedSocialMetrica, AnuncioMetrica])],
  controllers: [MarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
