import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import {
  QueryAnunciosDto,
  QueryMarketingDto,
  QueryResumenMarketingDto,
} from './dto/query-marketing.dto';
import { AnuncioMetrica } from './entities/anuncio-metrica.entity';
import { RedSocialMetrica } from './entities/red-social-metrica.entity';

type SumRow = Record<string, string | null>;

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(RedSocialMetrica)
    private readonly redesRepository: Repository<RedSocialMetrica>,
    @InjectRepository(AnuncioMetrica)
    private readonly anunciosRepository: Repository<AnuncioMetrica>,
  ) {}

  async findRedesSociales(query: QueryMarketingDto) {
    this.validateRange(query.from, query.to);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const qb = this.redesQuery(query)
      .orderBy('metrica.mes', 'DESC')
      .addOrderBy('metrica.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return this.paginated(data, total, page, limit);
  }

  async findRedSocial(id: number): Promise<RedSocialMetrica> {
    const metrica = await this.redesRepository.findOne({ where: { id } });
    if (!metrica) {
      throw new NotFoundException(`Métrica de red social #${id} no encontrada`);
    }
    return metrica;
  }

  async findAnuncios(query: QueryAnunciosDto) {
    this.validateRange(query.from, query.to);
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const qb = this.anunciosQuery(query)
      .orderBy('metrica.mes', 'DESC')
      .addOrderBy('metrica.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return this.paginated(data, total, page, limit);
  }

  async findAnuncio(id: number): Promise<AnuncioMetrica> {
    const metrica = await this.anunciosRepository.findOne({ where: { id } });
    if (!metrica) {
      throw new NotFoundException(`Métrica de anuncio #${id} no encontrada`);
    }
    return metrica;
  }

  async getResumen(query: QueryResumenMarketingDto) {
    this.validateRange(query.from, query.to);
    const [redes, anuncios, redesPorMes, anunciosPorMes, seguidoresActuales] =
      await Promise.all([
        this.redesQuery(query)
          .select('COALESCE(SUM(metrica.alcance), 0)', 'alcance')
          .addSelect(
            'COALESCE(SUM(metrica.likes_reacciones), 0)',
            'likes_reacciones',
          )
          .addSelect('COALESCE(SUM(metrica.comentarios), 0)', 'comentarios')
          .addSelect('COALESCE(SUM(metrica.compartir), 0)', 'compartir')
          .addSelect(
            'COALESCE(SUM(metrica.total_interacciones), 0)',
            'total_interacciones',
          )
          .addSelect(
            'COALESCE(SUM(metrica.seguidores_netos), 0)',
            'seguidores_netos',
          )
          .getRawOne<SumRow>(),
        this.anunciosQuery(query)
          .select('metrica.tipo_resultado', 'tipo_resultado')
          .addSelect('SUM(metrica.resultado)', 'resultado')
          .addSelect('SUM(metrica.inversion)', 'inversion')
          .groupBy('metrica.tipo_resultado')
          .orderBy('metrica.tipo_resultado', 'ASC')
          .getRawMany<SumRow>(),
        this.redesQuery(query)
          .select('metrica.mes', 'mes')
          .addSelect('SUM(metrica.alcance)', 'alcance')
          .addSelect('SUM(metrica.total_interacciones)', 'total_interacciones')
          .addSelect('SUM(metrica.seguidores_netos)', 'seguidores_netos')
          .groupBy('metrica.mes')
          .orderBy('metrica.mes', 'ASC')
          .getRawMany<SumRow>(),
        this.anunciosQuery(query)
          .select('metrica.mes', 'mes')
          .addSelect('metrica.tipo_resultado', 'tipo_resultado')
          .addSelect('SUM(metrica.resultado)', 'resultado')
          .addSelect('SUM(metrica.inversion)', 'inversion')
          .groupBy('metrica.mes')
          .addGroupBy('metrica.tipo_resultado')
          .orderBy('metrica.mes', 'ASC')
          .addOrderBy('metrica.tipo_resultado', 'ASC')
          .getRawMany<SumRow>(),
        this.latestFollowers(query),
      ]);

    const seguidoresPorPlataforma = seguidoresActuales.map((row) =>
      this.numericRow(row, ['plataforma', 'mes']),
    );

    return {
      redesSociales: {
        ...this.numericRow(redes),
        total_seguidores: seguidoresPorPlataforma.reduce(
          (total, row) => total + Number(row.total_seguidores),
          0,
        ),
        seguidoresPorPlataforma,
      },
      anuncios: {
        porTipoResultado: anuncios.map((row) =>
          this.numericRow(row, ['tipo_resultado']),
        ),
      },
      porMes: {
        redesSociales: redesPorMes.map((row) => this.numericRow(row, ['mes'])),
        anuncios: anunciosPorMes.map((row) =>
          this.numericRow(row, ['mes', 'tipo_resultado']),
        ),
      },
    };
  }

  async getFiltros() {
    const [
      plataformasRedes,
      plataformasAnuncios,
      tiposCliente,
      tiposResultado,
    ] = await Promise.all([
      this.distinctValues(this.redesRepository, 'plataforma'),
      this.distinctValues(this.anunciosRepository, 'plataforma'),
      this.distinctValues(this.anunciosRepository, 'tipo_cliente'),
      this.distinctValues(this.anunciosRepository, 'tipo_resultado'),
    ]);

    return {
      plataformas: [
        ...new Set([...plataformasRedes, ...plataformasAnuncios]),
      ].sort(),
      tiposCliente,
      tiposResultado,
    };
  }

  private redesQuery(
    query: QueryResumenMarketingDto,
  ): SelectQueryBuilder<RedSocialMetrica> {
    const qb = this.redesRepository.createQueryBuilder('metrica');
    this.applyCommonFilters(qb, query);
    return qb;
  }

  private anunciosQuery(
    query: QueryResumenMarketingDto | QueryAnunciosDto,
  ): SelectQueryBuilder<AnuncioMetrica> {
    const qb = this.anunciosRepository.createQueryBuilder('metrica');
    this.applyCommonFilters(qb, query);

    if ('tipo_cliente' in query && query.tipo_cliente) {
      qb.andWhere('metrica.tipo_cliente = :tipoCliente', {
        tipoCliente: query.tipo_cliente,
      });
    }
    if ('tipo_resultado' in query && query.tipo_resultado) {
      qb.andWhere('metrica.tipo_resultado = :tipoResultado', {
        tipoResultado: query.tipo_resultado,
      });
    }
    return qb;
  }

  private latestFollowers(query: QueryResumenMarketingDto): Promise<SumRow[]> {
    const qb = this.redesQuery(query)
      .select('metrica.plataforma', 'plataforma')
      .addSelect('metrica.mes', 'mes')
      .addSelect('MAX(metrica.total_seguidores)', 'total_seguidores')
      .andWhere((outerQb) => {
        const latestMonth = outerQb
          .subQuery()
          .select('MAX(latest.mes)')
          .from(RedSocialMetrica, 'latest')
          .where('latest.plataforma = metrica.plataforma');

        if (query.from) {
          latestMonth.andWhere('latest.mes >= :latestFrom', {
            latestFrom: query.from,
          });
        }
        if (query.to) {
          latestMonth.andWhere('latest.mes <= :latestTo', {
            latestTo: query.to,
          });
        }
        return `metrica.mes = ${latestMonth.getQuery()}`;
      })
      .groupBy('metrica.plataforma')
      .addGroupBy('metrica.mes')
      .orderBy('metrica.plataforma', 'ASC');

    return qb.getRawMany<SumRow>();
  }

  private applyCommonFilters<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    query: QueryResumenMarketingDto,
  ): void {
    if (query.plataforma) {
      qb.andWhere('metrica.plataforma = :plataforma', {
        plataforma: query.plataforma,
      });
    }
    if (query.from) {
      qb.andWhere('metrica.mes >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('metrica.mes <= :to', { to: query.to });
    }
  }

  private async distinctValues<T extends ObjectLiteral>(
    repository: Repository<T>,
    column: string,
  ): Promise<string[]> {
    const rows = await repository
      .createQueryBuilder('metrica')
      .select(`metrica.${column}`, 'value')
      .where(`metrica.${column} IS NOT NULL`)
      .andWhere(`metrica.${column} <> ''`)
      .distinct(true)
      .orderBy(`metrica.${column}`, 'ASC')
      .getRawMany<{ value: string }>();
    return rows.map(({ value }) => value);
  }

  private paginated<T>(data: T[], total: number, page: number, limit: number) {
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };
  }

  private numericRow(
    row: SumRow | undefined,
    stringFields: string[] = [],
  ): Record<string, string | number | null> {
    if (!row) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key,
        stringFields.includes(key) || value === null ? value : Number(value),
      ]),
    );
  }

  private validateRange(from?: string, to?: string): void {
    if (from && to && new Date(from).getTime() > new Date(to).getTime()) {
      throw new BadRequestException(
        'La fecha inicial (from) no puede ser posterior a la fecha final (to)',
      );
    }
  }
}
