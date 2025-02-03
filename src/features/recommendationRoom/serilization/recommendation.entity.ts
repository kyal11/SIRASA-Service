import { SlotEntity } from 'src/models/slotRoom/serialization/slot.entity';

export class RecommendationEntity {
  roomId: string;
  roomName: string;
  roomDate: string;
  slots: SlotEntity[];
}
