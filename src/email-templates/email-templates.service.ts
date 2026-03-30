import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private templatesRepo: Repository<EmailTemplate>,
  ) {}

  async findAllByUser(userId: string): Promise<EmailTemplate[]> {
    return this.templatesRepo.find({ where: { createdById: userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId?: string): Promise<EmailTemplate> {
    const tpl = await this.templatesRepo.findOne({ where: { id } });
    if (!tpl) throw new NotFoundException('Template not found');
    if (userId && tpl.createdById && tpl.createdById !== userId) {
      throw new NotFoundException('Template not found');
    }
    return tpl;
  }

  async create(dto: CreateEmailTemplateDto, userId: string): Promise<EmailTemplate> {
    const entity = this.templatesRepo.create({ ...dto, createdById: userId });
    return this.templatesRepo.save(entity);
  }

  async update(id: string, dto: UpdateEmailTemplateDto, userId: string): Promise<EmailTemplate> {
    const tpl = await this.findOne(id, userId);
    Object.assign(tpl, dto);
    return this.templatesRepo.save(tpl);
  }

  async remove(id: string, userId: string): Promise<void> {
    const tpl = await this.findOne(id, userId);
    await this.templatesRepo.remove(tpl);
  }

  async seedDefaultsForUser(userId: string): Promise<number> {
    const defaults = [
      { name: 'Welcome', subject: 'Welcome to PANDI CRM', body: '<p>Welcome {{firstName}}!</p>', category: 'welcome', isActive: true },
      { name: 'Follow Up', subject: 'Following up', body: '<p>Hi {{firstName}}, following up on our conversation.</p>', category: 'followup', isActive: true },
      { name: 'Newsletter', subject: 'Latest updates', body: '<p>Here are the latest updates...</p>', category: 'newsletter', isActive: true },
    ];

    const created = [];
    for (const d of defaults) {
      const e = this.templatesRepo.create({ ...d, createdById: userId });
      created.push(await this.templatesRepo.save(e));
    }

    return created.length;
  }
}
