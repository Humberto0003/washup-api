import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { QueueStatus } from '../../common/enums';

export class MoveServiceOrderDto {
  @IsEnum(QueueStatus)
  status: QueueStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;
}
