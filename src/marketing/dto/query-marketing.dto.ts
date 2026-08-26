import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryMarketingDto {
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

  @ApiPropertyOptional({ example: 'Facebook' })
  @IsOptional()
  @IsString()
  plataforma?: string;

  @ApiPropertyOptional({
    description: 'Mes inicial, inclusive',
    example: '2026-01-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Mes final, inclusive',
    example: '2026-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class QueryAnunciosDto extends QueryMarketingDto {
  @ApiPropertyOptional({ example: 'Residencial' })
  @IsOptional()
  @IsString()
  tipo_cliente?: string;

  @ApiPropertyOptional({ example: 'Mensajes' })
  @IsOptional()
  @IsString()
  tipo_resultado?: string;
}

export class QueryResumenMarketingDto {
  @ApiPropertyOptional({ example: 'Facebook' })
  @IsOptional()
  @IsString()
  plataforma?: string;

  @ApiPropertyOptional({
    description: 'Mes inicial, inclusive',
    example: '2026-01-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Mes final, inclusive',
    example: '2026-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
