import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import {
  ESTATUS,
  MOTIVOS,
  PLANES_INSTALADOS,
  PUEBLOS,
  REFERRED_BY,
} from './ticket-filters.constants';

type CountRow = { key: string | null; count: string };

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async findAll(query: QueryTicketsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const qb = this.filteredQuery(query);
    qb.orderBy('ticket.fecha_hora', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { ticket_id: id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} no encontrado`);
    }

    return ticket;
  }

  async getStats(query: QueryTicketsDto) {
    const [
      total,
      byEstatus,
      byPueblo,
      byAgente,
      byTipoCliente,
      byPlan,
      byMotivo,
      byDay,
    ] = await Promise.all([
      this.filteredQuery(query).getCount(),
      this.groupCount(query, 'ticket.estatus'),
      this.groupCount(query, 'ticket.pueblo'),
      this.groupCount(query, 'ticket.agente'),
      this.groupCount(query, 'ticket.tipo_cliente'),
      this.groupCount(query, 'ticket.plan_instalado'),
      this.groupCount(query, 'ticket.motivo'),
      this.countByDay(query),
    ]);

    return {
      total,
      byEstatus,
      byPueblo,
      byAgente,
      byTipoCliente,
      byPlan,
      byMotivo,
      byDay,
    };
  }

  async getFilterOptions() {
    const [agente, tipo_cliente] = await Promise.all([
      this.distinctValues('agente'),
      this.distinctValues('tipo_cliente'),
    ]);

    return {
      pueblo: [...PUEBLOS],
      referred_by: [...REFERRED_BY],
      estatus: [...ESTATUS],
      motivo: [...MOTIVOS],
      plan_instalado: [...PLANES_INSTALADOS],
      agente,
      tipo_cliente,
    };
  }

  private filteredQuery(query: QueryTicketsDto): SelectQueryBuilder<Ticket> {
    const qb = this.ticketRepository.createQueryBuilder('ticket');

    if (query.estatus) {
      qb.andWhere('ticket.estatus = :estatus', { estatus: query.estatus });
    }
    if (query.pueblo) {
      qb.andWhere('ticket.pueblo = :pueblo', { pueblo: query.pueblo });
    }
    if (query.agente) {
      qb.andWhere('ticket.agente = :agente', { agente: query.agente });
    }
    if (query.tipo_cliente) {
      qb.andWhere('ticket.tipo_cliente = :tipo_cliente', {
        tipo_cliente: query.tipo_cliente,
      });
    }
    if (query.referred_by) {
      qb.andWhere('ticket.referred_by = :referred_by', {
        referred_by: query.referred_by,
      });
    }
    if (query.plan_instalado) {
      qb.andWhere('ticket.plan_instalado = :plan_instalado', {
        plan_instalado: query.plan_instalado,
      });
    }
    if (query.motivo !== undefined) {
      qb.andWhere('ticket.motivo = :motivo', { motivo: query.motivo });
    }
    if (query.from) {
      qb.andWhere('ticket.fecha_hora >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('ticket.fecha_hora <= :to', { to: query.to });
    }
    if (query.search) {
      qb.andWhere(
        '(ticket.asunto LIKE :search OR ticket.motivo LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb;
  }

  private async groupCount(query: QueryTicketsDto, column: string) {
    const rows = await this.filteredQuery(query)
      .select(column, 'key')
      .addSelect('COUNT(*)', 'count')
      .groupBy(column)
      .orderBy('count', 'DESC')
      .getRawMany<CountRow>();

    return rows.map((row) => ({
      key: row.key,
      count: Number(row.count),
    }));
  }

  private async countByDay(query: QueryTicketsDto) {
    const rows = await this.filteredQuery(query)
      .select('DATE(ticket.fecha_hora)', 'key')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE(ticket.fecha_hora)')
      .orderBy('key', 'ASC')
      .getRawMany<CountRow>();

    return rows.map((row) => ({
      date: row.key,
      count: Number(row.count),
    }));
  }

  private async distinctValues(column: keyof Ticket): Promise<string[]> {
    const rows = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select(`ticket.${column}`, 'value')
      .where(`ticket.${column} IS NOT NULL`)
      .andWhere(`ticket.${column} <> ''`)
      .distinct(true)
      .orderBy(`ticket.${column}`, 'ASC')
      .getRawMany<{ value: string }>();

    return rows.map((row) => row.value);
  }
}
