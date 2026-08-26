import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};

@Entity('redes_sociales_metricas')
export class RedSocialMetrica {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ApiProperty({ example: 'Facebook' })
  @Column({ type: 'varchar', length: 50 })
  plataforma: string;

  @ApiProperty({ example: '2026-08-01', type: String, format: 'date' })
  @Column({ type: 'date' })
  mes: string;

  @ApiProperty({ example: 409424 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  alcance: number;

  @ApiProperty({ example: 29 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  likes_reacciones: number;

  @ApiProperty({ example: 18 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  comentarios: number;

  @ApiProperty({ example: 7 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  compartir: number;

  @ApiProperty({ example: 54 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  total_interacciones: number;

  @ApiProperty({ example: 32 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  seguidores_netos: number;

  @ApiProperty({ example: 98054 })
  @Column({ type: 'bigint', default: 0, transformer: bigintTransformer })
  total_seguidores: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  actualizado_en: Date;
}
