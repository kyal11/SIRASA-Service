import { RoomEntity } from 'src/models/room/serialization/room.entity';

class GreedyRecoomendation {
  constructor(
    private readonly participant: number,
    private readonly rooms: RoomEntity[],
  ) {}
}
