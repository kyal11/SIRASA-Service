import { RoomEntity } from 'src/models/room/serialization/room.entity';

class GreedyRecoomendation {
  private limitReccomend: number = 2;
  constructor(
    private readonly participant: number,
    private readonly rooms: RoomEntity[],
  ) {}
}
