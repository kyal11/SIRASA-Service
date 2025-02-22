import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from 'src/config/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const isBlacklisted = await this.redisService.get('blacklist:' + token);
    if (isBlacklisted) {
      throw new HttpException(
        'Token already blacklisted',
        HttpStatus.BAD_REQUEST,
      );
    }
    return {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
      email: payload.email,
      isVerified: payload.isVerified,
    };
  }

  async blackListToken(token: string, expiresIn: number) {
    await this.redisService.set('blacklist:' + token, 'true', expiresIn);
  }

  async isBlackListed(token: string): Promise<boolean> {
    return !!(await this.redisService.get('blacklist:' + token));
  }
}
