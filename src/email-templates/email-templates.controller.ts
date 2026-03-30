import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('email-templates')
@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private readonly svc: EmailTemplatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.userId;
    return { templates: await this.svc.findAllByUser(userId) };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreateEmailTemplateDto) {
    const userId = req.user?.userId;
    return await this.svc.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    const userId = req.user?.userId;
    return await this.svc.update(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId;
    await this.svc.remove(id, userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('seed')
  async seed(@Req() req: any) {
    const userId = req.user?.userId;
    const count = await this.svc.seedDefaultsForUser(userId);
    return { count };
  }
}
