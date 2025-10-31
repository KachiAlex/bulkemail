import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { Segment } from './entities/segment.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateSegmentDto } from './dto/create-segment.dto';
import * as csv from 'csv-parse';
import * as stringify from 'csv-stringify';
import { parse } from 'csv-parse/sync';
import { stringify as stringifySync } from 'csv-stringify/sync';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
    @InjectRepository(Segment)
    private segmentsRepository: Repository<Segment>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const existingContact = await this.contactsRepository.findOne({
      where: { email: createContactDto.email },
    });

    if (existingContact) {
      throw new ConflictException('Contact with this email already exists');
    }

    const contact = this.contactsRepository.create(createContactDto);
    return this.contactsRepository.save(contact);
  }

  async findAll(filters?: any): Promise<Contact[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.tags) {
      where.tags = filters.tags;
    }

    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters?.search) {
      // For search, we'll use query builder
      return this.contactsRepository
        .createQueryBuilder('contact')
        .where('contact.firstName ILIKE :search', { search: `%${filters.search}%` })
        .orWhere('contact.lastName ILIKE :search', { search: `%${filters.search}%` })
        .orWhere('contact.email ILIKE :search', { search: `%${filters.search}%` })
        .orWhere('contact.company ILIKE :search', { search: `%${filters.search}%` })
        .leftJoinAndSelect('contact.owner', 'owner')
        .orderBy('contact.createdAt', 'DESC')
        .getMany();
    }

    return this.contactsRepository.find({
      where,
      relations: ['owner'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return contact;
  }

  async update(id: string, updateContactDto: UpdateContactDto): Promise<Contact> {
    const contact = await this.findOne(id);
    Object.assign(contact, updateContactDto);
    return this.contactsRepository.save(contact);
  }

  async remove(id: string): Promise<void> {
    const contact = await this.findOne(id);
    await this.contactsRepository.remove(contact);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await this.contactsRepository.delete(ids);
  }

  async updateLeadScore(id: string, score: number): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.leadScore = score;
    return this.contactsRepository.save(contact);
  }

  async addTags(id: string, tags: string[]): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.tags = [...new Set([...contact.tags, ...tags])];
    return this.contactsRepository.save(contact);
  }

  async removeTags(id: string, tags: string[]): Promise<Contact> {
    const contact = await this.findOne(id);
    contact.tags = contact.tags.filter(tag => !tags.includes(tag));
    return this.contactsRepository.save(contact);
  }

  // Import/Export functionality
  async importFromCsv(csvData: Buffer): Promise<{ imported: number; errors: any[] }> {
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
    });

    const errors = [];
    let imported = 0;

    for (const record of records) {
      try {
        const contactDto: CreateContactDto = {
          firstName: record.firstName || record.first_name,
          lastName: record.lastName || record.last_name,
          email: record.email,
          phone: record.phone,
          company: record.company,
          jobTitle: record.jobTitle || record.job_title,
          website: record.website,
          city: record.city,
          state: record.state,
          country: record.country,
          status: record.status,
          tags: record.tags ? record.tags.split(',').map(t => t.trim()) : [],
        };

        await this.create(contactDto);
        imported++;
      } catch (error) {
        errors.push({ record, error: error.message });
      }
    }

    return { imported, errors };
  }

  async exportToCsv(): Promise<string> {
    const contacts = await this.findAll();

    const records = contacts.map(contact => ({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      jobTitle: contact.jobTitle,
      website: contact.website,
      city: contact.city,
      state: contact.state,
      country: contact.country,
      status: contact.status,
      leadScore: contact.leadScore,
      tags: contact.tags.join(','),
      createdAt: contact.createdAt,
    }));

    return stringifySync(records, {
      header: true,
    });
  }

  // Segment functionality
  async createSegment(createSegmentDto: CreateSegmentDto, userId: string): Promise<Segment> {
    const segment = this.segmentsRepository.create({
      ...createSegmentDto,
      createdById: userId,
    });

    const savedSegment = await this.segmentsRepository.save(segment);
    await this.updateSegmentCount(savedSegment.id);
    return savedSegment;
  }

  async findAllSegments(): Promise<Segment[]> {
    return this.segmentsRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSegment(id: string): Promise<Segment> {
    const segment = await this.segmentsRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!segment) {
      throw new NotFoundException(`Segment with ID ${id} not found`);
    }

    return segment;
  }

  async getSegmentContacts(id: string): Promise<Contact[]> {
    const segment = await this.findSegment(id);
    return this.evaluateSegment(segment.rules);
  }

  async updateSegmentCount(segmentId: string): Promise<void> {
    const contacts = await this.getSegmentContacts(segmentId);
    await this.segmentsRepository.update(segmentId, {
      contactCount: contacts.length,
    });
  }

  private async evaluateSegment(rules: any): Promise<Contact[]> {
    const queryBuilder = this.contactsRepository.createQueryBuilder('contact');

    const { conditions, logic } = rules;

    conditions.forEach((condition, index) => {
      const { field, operator, value } = condition;
      const paramName = `value${index}`;

      let whereClause = '';

      switch (operator) {
        case 'equals':
          whereClause = `contact.${field} = :${paramName}`;
          break;
        case 'contains':
          whereClause = `contact.${field} ILIKE :${paramName}`;
          break;
        case 'greaterThan':
          whereClause = `contact.${field} > :${paramName}`;
          break;
        case 'lessThan':
          whereClause = `contact.${field} < :${paramName}`;
          break;
        case 'in':
          whereClause = `contact.${field} IN (:...${paramName})`;
          break;
        case 'notIn':
          whereClause = `contact.${field} NOT IN (:...${paramName})`;
          break;
      }

      if (index === 0) {
        queryBuilder.where(whereClause, {
          [paramName]: operator === 'contains' ? `%${value}%` : value,
        });
      } else if (logic === 'AND') {
        queryBuilder.andWhere(whereClause, {
          [paramName]: operator === 'contains' ? `%${value}%` : value,
        });
      } else {
        queryBuilder.orWhere(whereClause, {
          [paramName]: operator === 'contains' ? `%${value}%` : value,
        });
      }
    });

    return queryBuilder.getMany();
  }

  async removeSegment(id: string): Promise<void> {
    const segment = await this.findSegment(id);
    await this.segmentsRepository.remove(segment);
  }
}

