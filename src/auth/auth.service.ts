import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  login(dto: LoginDto) {
    if (dto.email !== 'admin@washup.com' || dto.password !== '123456') {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    return {
      user: {
        name: 'Administrador WashUp',
        role: 'ADMIN',
      },
      accessToken: 'washup-local-admin-token',
    };
  }
}
