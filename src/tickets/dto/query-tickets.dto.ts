import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ESTATUS,
  MOTIVOS,
  PLANES_INSTALADOS,
  PUEBLOS,
  REFERRED_BY,
} from '../ticket-filters.constants';

export class QueryTicketsDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, default: 50, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Estatus',
    enum: ESTATUS,
  })
  @IsOptional()
  @IsIn([...ESTATUS])
  estatus?: string;

  @ApiPropertyOptional({
    description: 'Pueblo',
    enum: PUEBLOS,
  })
  @IsOptional()
  @IsIn([...PUEBLOS])
  pueblo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agente?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipo_cliente?: string;

  @ApiPropertyOptional({
    description: 'Referred by',
    enum: REFERRED_BY,
  })
  @IsOptional()
  @IsIn([...REFERRED_BY])
  referred_by?: string;

  @ApiPropertyOptional({
    description: 'Motivo',
    enum: MOTIVOS,
  })
  @IsOptional()
  @IsIn([...MOTIVOS])
  motivo?: string;

  @ApiPropertyOptional({
    description: 'Plan Instalado',
    enum: PLANES_INSTALADOS,
  })
  @IsOptional()
  @IsIn([...PLANES_INSTALADOS])
  plan_instalado?: string;

  @ApiPropertyOptional({ description: 'Busca en asunto y motivo' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
