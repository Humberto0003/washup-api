import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { QueueStatus } from '../../common/enums';

export class ReorderServiceOrderItemDto {
  @IsString()
  id: string;

  @IsEnum(QueueStatus)
  status: QueueStatus;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  position: number;
}

export class ReorderServiceOrdersDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderServiceOrderItemDto)
  items: ReorderServiceOrderItemDto[];
}
