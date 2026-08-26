import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('anuncios_metricas')
export class AnuncioMetrica {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ example: 'Facebook' })
  @Column({ type: 'varchar', length: 50 })
  plataforma: string;

  @ApiProperty({ example: 'Residencial' })
  @Column({ type: 'varchar', length: 50 })
  tipo_cliente: string;

  @ApiProperty({ example: '2026-08-01', type: String, format: 'date' })
  @Column({ type: 'date' })
  mes: string;

  @ApiProperty({ example: 'Mensajes' })
  @Column({ type: 'varchar', length: 100 })
  tipo_resultado: string;

  @ApiProperty({ example: 410 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  resultado: number;

  @ApiProperty({ example: 3514.93 })
  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  inversion: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  actualizado_en: Date;
}
