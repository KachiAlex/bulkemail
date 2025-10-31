import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts with optional filters' })
  findAll(@Query() filters: any) {
    return this.contactsService.findAll(filters);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export contacts to CSV' })
  async exportContacts(@Res() res: Response) {
    const csv = await this.contactsService.exportToCsv();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=contacts.csv');
    res.send(csv);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import contacts from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importContacts(@UploadedFile() file: Express.Multer.File) {
    return this.contactsService.importFromCsv(file.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact' })
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Delete multiple contacts' })
  bulkDelete(@Body('ids') ids: string[]) {
    return this.contactsService.bulkDelete(ids);
  }

  @Patch(':id/lead-score')
  @ApiOperation({ summary: 'Update contact lead score' })
  updateLeadScore(@Param('id') id: string, @Body('score') score: number) {
    return this.contactsService.updateLeadScore(id, score);
  }

  @Post(':id/tags')
  @ApiOperation({ summary: 'Add tags to contact' })
  addTags(@Param('id') id: string, @Body('tags') tags: string[]) {
    return this.contactsService.addTags(id, tags);
  }

  @Delete(':id/tags')
  @ApiOperation({ summary: 'Remove tags from contact' })
  removeTags(@Param('id') id: string, @Body('tags') tags: string[]) {
    return this.contactsService.removeTags(id, tags);
  }

  // Segments
  @Post('segments')
  @ApiOperation({ summary: 'Create a new segment' })
  createSegment(@Body() createSegmentDto: CreateSegmentDto, @Request() req) {
    return this.contactsService.createSegment(createSegmentDto, req.user.userId);
  }

  @Get('segments/all')
  @ApiOperation({ summary: 'Get all segments' })
  findAllSegments() {
    return this.contactsService.findAllSegments();
  }

  @Get('segments/:id')
  @ApiOperation({ summary: 'Get segment by ID' })
  findSegment(@Param('id') id: string) {
    return this.contactsService.findSegment(id);
  }

  @Get('segments/:id/contacts')
  @ApiOperation({ summary: 'Get contacts in segment' })
  getSegmentContacts(@Param('id') id: string) {
    return this.contactsService.getSegmentContacts(id);
  }

  @Delete('segments/:id')
  @ApiOperation({ summary: 'Delete segment' })
  removeSegment(@Param('id') id: string) {
    return this.contactsService.removeSegment(id);
  }
}

