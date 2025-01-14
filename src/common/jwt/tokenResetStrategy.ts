import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class TokenResetStrategy extends PassportStrategy(
  Strategy,
  'token-reset-password',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_RESET_PASS,
    });
  }

  async validate(payload: any) {
    return { email: payload.email };
  }
}
