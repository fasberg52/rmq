import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export enum OrderStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LIQUID = 'LIQUID',
}

export class GetAllOrderDto extends PaginationDto {
  @ApiProperty()
  @IsString()
  symbol: string;

  @ApiProperty({ enum: OrderStatusEnum, enumName: 'OrderStatusEnum' })
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;

  @ApiPropertyOptional({ default: 'id' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value.trim())
  sort?: string;

  @ApiPropertyOptional({ default: 'DESC' })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  @Transform(({ value }) => value.toUpperCase().trim())
  @ApiProperty()
  sortOrder: string;
}
