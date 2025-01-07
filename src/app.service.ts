import { Injectable } from '@nestjs/common';
import { UsersService } from './models/users/users.service';

@Injectable()
export class AppService {
  constructor(private readonly UsersService: UsersService) {}
}
