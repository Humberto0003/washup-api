import { IsEnum } from 'class-validator';
import { PriorityDirection } from '../../common/enums';

export class ChangePriorityDto {
  @IsEnum(PriorityDirection)
  direction: PriorityDirection;
}
