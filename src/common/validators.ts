import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { isValidPlate } from './plate';

function onlyDigits(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function IsPlate(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isPlate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isValidPlate(value);
        },
      },
    });
  };
}

export function HasDigitsLength(length: number, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'hasDigitsLength',
      target: object.constructor,
      propertyName,
      constraints: [length],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && onlyDigits(value).length === length;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} deve conter ${args.constraints[0]} digitos.`;
        },
      },
    });
  };
}
