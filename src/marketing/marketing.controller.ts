import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  MarketingFiltrosDto,
  MarketingResumenDto,
  PaginatedAnunciosDto,
  PaginatedRedesSocialesDto,
} from './dto/marketing-responses.dto';
import {
  QueryAnunciosDto,
  QueryMarketingDto,
  QueryResumenMarketingDto,
} from './dto/query-marketing.dto';
import { AnuncioMetrica } from './entities/anuncio-metrica.entity';
import { RedSocialMetrica } from './entities/red-social-metrica.entity';
import { MarketingService } from './marketing.service';

@ApiTags('marketing')
@ApiBearerAuth()
@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('redes-sociales')
  @ApiOperation({
    summary: 'Listado paginado de métricas de redes sociales',
  })
  @ApiOkResponse({ type: PaginatedRedesSocialesDto })
  findRedesSociales(@Query() query: QueryMarketingDto) {
    return this.marketingService.findRedesSociales(query);
  }

  @Get('redes-sociales/:id')
  @ApiOperation({ summary: 'Detalle de una métrica de red social' })
  @ApiOkResponse({ type: RedSocialMetrica })
  @ApiNotFoundResponse({ description: 'Métrica de red social no encontrada' })
  findRedSocial(@Param('id', ParseIntPipe) id: number) {
    return this.marketingService.findRedSocial(id);
  }

  @Get('anuncios')
  @ApiOperation({ summary: 'Listado paginado de métricas de anuncios' })
  @ApiOkResponse({ type: PaginatedAnunciosDto })
  findAnuncios(@Query() query: QueryAnunciosDto) {
    return this.marketingService.findAnuncios(query);
  }

  @Get('anuncios/:id')
  @ApiOperation({ summary: 'Detalle de una métrica de anuncio' })
  @ApiOkResponse({ type: AnuncioMetrica })
  @ApiNotFoundResponse({ description: 'Métrica de anuncio no encontrada' })
  findAnuncio(@Param('id', ParseIntPipe) id: number) {
    return this.marketingService.findAnuncio(id);
  }

  @Get('resumen')
  @ApiOperation({
    summary: 'Totales y evolución mensual de redes sociales y anuncios',
    description:
      'La inversión de anuncios se agrupa por tipo_resultado. No hay total global porque en Facebook el mismo spend puede repetirse en varios KPIs.',
  })
  @ApiOkResponse({ type: MarketingResumenDto })
  getResumen(@Query() query: QueryResumenMarketingDto) {
    return this.marketingService.getResumen(query);
  }

  @Get('filtros')
  @ApiOperation({
    summary: 'Plataformas, tipos de cliente y tipos de resultado disponibles',
  })
  @ApiOkResponse({ type: MarketingFiltrosDto })
  getFiltros() {
    return this.marketingService.getFiltros();
  }
}
