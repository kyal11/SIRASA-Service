import { Controller, Get, UseGuards } from '@nestjs/common';
import { DataSummary } from './serilization/data-summary';
import { CrmService } from './crm.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Roles } from 'src/common/roles/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'crm', version: '1' })
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'admin')
  async getDataSummary(): Promise<DataSummary> {
    return this.crmService.dataSummary();
  }
}
