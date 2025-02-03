import { SlotEntity } from 'src/models/slotRoom/serialization/slot.entity';

export class RecommendationDto {
  roomId: string;

  // roomName: string;

  slots: SlotEntity[];

  participant: number;
}
