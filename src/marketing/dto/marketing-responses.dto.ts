import { ApiProperty } from '@nestjs/swagger';
import { AnuncioMetrica } from '../entities/anuncio-metrica.entity';
import { RedSocialMetrica } from '../entities/red-social-metrica.entity';

export class PaginatedRedesSocialesDto {
  @ApiProperty({ type: [RedSocialMetrica] })
  data: RedSocialMetrica[];

  @ApiProperty({ example: 2 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class PaginatedAnunciosDto {
  @ApiProperty({ type: [AnuncioMetrica] })
  data: AnuncioMetrica[];

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class MarketingFiltrosDto {
  @ApiProperty({ example: ['Facebook', 'Instagram'] })
  plataformas: string[];

  @ApiProperty({ example: ['Residencial'] })
  tiposCliente: string[];

  @ApiProperty({
    example: ['Alcance', 'Interacciones', 'Leads', 'Mensajes', 'ThruPlays'],
  })
  tiposResultado: string[];
}

class SeguidoresPorPlataformaDto {
  @ApiProperty({ example: 'Facebook' })
  plataforma: string;

  @ApiProperty({ example: '2026-08-01' })
  mes: string;

  @ApiProperty({ example: 98054 })
  total_seguidores: number;
}

class RedesSocialesResumenDto {
  @ApiProperty({ example: 561586 })
  alcance: number;

  @ApiProperty({ example: 333 })
  likes_reacciones: number;

  @ApiProperty({ example: 39 })
  comentarios: number;

  @ApiProperty({ example: 65 })
  compartir: number;

  @ApiProperty({ example: 437 })
  total_interacciones: number;

  @ApiProperty({ example: 99 })
  seguidores_netos: number;

  @ApiProperty({
    description: 'Suma de seguidores del mes más reciente por plataforma',
    example: 105835,
  })
  total_seguidores: number;

  @ApiProperty({ type: [SeguidoresPorPlataformaDto] })
  seguidoresPorPlataforma: SeguidoresPorPlataformaDto[];
}

class AnuncioPorTipoResultadoDto {
  @ApiProperty({ example: 'Mensajes' })
  tipo_resultado: string;

  @ApiProperty({ example: 410 })
  resultado: number;

  @ApiProperty({
    example: 3514.93,
    description:
      'No sumar inversión entre tipos: en Facebook el mismo spend puede repetirse',
  })
  inversion: number;
}

class RedesPorMesDto {
  @ApiProperty({ example: '2026-08-01' })
  mes: string;

  @ApiProperty({ example: 561586 })
  alcance: number;

  @ApiProperty({ example: 437 })
  total_interacciones: number;

  @ApiProperty({ example: 99 })
  seguidores_netos: number;
}

class AnunciosPorMesDto {
  @ApiProperty({ example: '2026-08-01' })
  mes: string;

  @ApiProperty({ example: 'Mensajes' })
  tipo_resultado: string;

  @ApiProperty({ example: 410 })
  resultado: number;

  @ApiProperty({ example: 3514.93 })
  inversion: number;
}

class AnunciosResumenDto {
  @ApiProperty({ type: [AnuncioPorTipoResultadoDto] })
  porTipoResultado: AnuncioPorTipoResultadoDto[];
}

class MarketingPorMesDto {
  @ApiProperty({ type: [RedesPorMesDto] })
  redesSociales: RedesPorMesDto[];

  @ApiProperty({ type: [AnunciosPorMesDto] })
  anuncios: AnunciosPorMesDto[];
}

export class MarketingResumenDto {
  @ApiProperty({ type: RedesSocialesResumenDto })
  redesSociales: RedesSocialesResumenDto;

  @ApiProperty({ type: AnunciosResumenDto })
  anuncios: AnunciosResumenDto;

  @ApiProperty({ type: MarketingPorMesDto })
  porMes: MarketingPorMesDto;
}
