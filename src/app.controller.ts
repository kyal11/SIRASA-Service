import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './models/users/users.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly UsersService: UsersService,
  ) {}
}
