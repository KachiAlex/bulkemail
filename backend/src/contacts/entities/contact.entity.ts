import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ContactStatus {
  NEW = 'new',
  QUALIFIED = 'qualified',
  CONTACTED = 'contacted',
  NEGOTIATING = 'negotiating',
  CONVERTED = 'converted',
  LOST = 'lost',
}

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.NEW,
  })
  status: ContactStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  leadScore: number;

  @Column({ type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ nullable: true })
  ownerId: string;

  @Column({ default: false })
  isSubscribed: boolean;

  @Column({ default: false })
  isDoNotContact: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastContactedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastEmailOpenedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLinkClickedAt: Date;

  @Column({ default: 0 })
  emailsSent: number;

  @Column({ default: 0 })
  emailsOpened: number;

  @Column({ default: 0 })
  linksClicked: number;

  @Column({ default: 0 })
  callsReceived: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

