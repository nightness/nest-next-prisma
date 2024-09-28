import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  NOW = 'NOW', // Server time
}

export class EventDto {
  @ApiProperty({
    description: 'Event type',
    example: 'NOW',
    enum: EventType,
    required: true,
  })
  type: EventType;

  @ApiProperty({
    description: 'User ID associated with the event',
    example: '1234567890',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'The message associated with the event',
    example: 'Hello world!',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Any URL associated with the event',
    example: 'https://example.com/image.png',
    required: false,
  })
  url?: string;

  @ApiProperty({
    description: 'Timestamp of the event',
    example: '2021-01-01T00:00:00.000Z',
    readOnly: true,
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Any extra data associated with the event',
    example: { extra: 'data' },
    required: false,
  })
  extra?: Record<string, unknown>;

  constructor(type: EventType, event: Omit<EventDto, 'timestamp'>) {
    Object.assign(this, event);
    this.timestamp = new Date();
    this.type = type;
  }
}
