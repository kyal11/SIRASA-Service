import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class TokenValidateStrategy extends PassportStrategy(
  Strategy,
  'token-validate-email',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_VALIDATE_EMAIL,
    });
  }

  async validate(payload: any) {
    return { email: payload.email };
  }
}
