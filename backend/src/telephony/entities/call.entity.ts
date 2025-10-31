import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Contact } from '../../contacts/entities/contact.entity';
import { User } from '../../users/entities/user.entity';

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BUSY = 'busy',
  NO_ANSWER = 'no-answer',
  CANCELLED = 'cancelled',
}

export enum CallDisposition {
  INTERESTED = 'interested',
  NOT_INTERESTED = 'not-interested',
  CALLBACK_REQUESTED = 'callback-requested',
  LEFT_VOICEMAIL = 'left-voicemail',
  WRONG_NUMBER = 'wrong-number',
  DO_NOT_CALL = 'do-not-call',
  FOLLOW_UP_NEEDED = 'follow-up-needed',
  DEAL_CLOSED = 'deal-closed',
}

@Entity('calls')
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: CallDirection,
  })
  direction: CallDirection;

  @Column({
    type: 'enum',
    enum: CallStatus,
    default: CallStatus.INITIATED,
  })
  status: CallStatus;

  @ManyToOne(() => Contact, { nullable: true })
  @JoinColumn({ name: 'contactId' })
  contact: Contact;

  @Column({ nullable: true })
  contactId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column()
  fromNumber: string;

  @Column()
  toNumber: string;

  @Column({ nullable: true })
  externalCallSid: string; // Twilio Call SID

  @Column({ type: 'int', default: 0 })
  duration: number; // in seconds

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({
    type: 'enum',
    enum: CallDisposition,
    nullable: true,
  })
  disposition: CallDisposition;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ nullable: true })
  recordingSid: string;

  @Column({ type: 'text', nullable: true })
  transcription: string;

  @Column({ type: 'text', nullable: true })
  aiSummary: string;

  @Column({ type: 'jsonb', nullable: true })
  sentiment: {
    score: number;
    label: string;
  };

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

