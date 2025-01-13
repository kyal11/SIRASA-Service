import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/config/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (await this.isBlackListed(payload.token)) {
      return null;
    }

    return {
      userId: payload.id,
      name: payload.name,
      role: payload.role,
      email: payload.email,
    };
  }

  async blackListToken(token: string, expiresIn: number) {
    await this.redisService.set('blacklist:' + token, 'true', expiresIn);
  }

  async isBlackListed(token: string): Promise<boolean> {
    return !!(await this.redisService.get('blacklist:' + token));
  }
}
