import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import { Ticket } from './entities/ticket.entity';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Listado paginado de tickets' })
  findAll(@Query() query: QueryTicketsDto) {
    return this.ticketsService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Agregados para dashboard (estatus, pueblo, agente, etc.)',
  })
  getStats(@Query() query: QueryTicketsDto) {
    return this.ticketsService.getStats(query);
  }

  @Get('filters')
  @ApiOperation({
    summary:
      'Opciones fijas de Pueblo, Referred by, Estatus, Motivo y Plan Instalado',
  })
  getFilterOptions() {
    return this.ticketsService.getFilterOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un ticket' })
  @ApiOkResponse({ type: Ticket })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }
}
