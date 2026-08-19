import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('tickets_osnet')
export class Ticket {
  @ApiProperty()
  @PrimaryColumn({ type: 'int' })
  ticket_id: number;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  tipo_cliente: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'text', nullable: true })
  asunto: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  pueblo: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'datetime', nullable: true })
  fecha_hora: Date | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  referred_by: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 50, nullable: true })
  estatus: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  motivo: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  plan_instalado: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  agente: string | null;
}
