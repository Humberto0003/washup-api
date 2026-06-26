import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { WashServiceType } from '../../common/enums';
import { HasDigitsLength, IsPlate } from '../../common/validators';

export class CreateServiceOrderDto {
  @IsString()
  @MinLength(3)
  customerName: string;

  @IsString()
  @HasDigitsLength(11)
  phone: string;

  @IsOptional()
  @IsString()
  @HasDigitsLength(11)
  cpf?: string;

  @IsString()
  @IsPlate()
  plate: string;

  @IsEnum(WashServiceType)
  serviceType: WashServiceType;
}
