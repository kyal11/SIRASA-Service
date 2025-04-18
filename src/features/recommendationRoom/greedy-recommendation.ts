import { RoomEntity } from 'src/models/room/serialization/room.entity';
import { RecommendationDto } from './validation/recommendation.dto';
import { RecommendationEntity } from './serilization/recommendation.entity';

export class GreedyRecommendation {
  private limitRecommend: number = 3;

  recommend(
    preferred: RecommendationDto,
    rooms: RoomEntity[],
  ): RecommendationEntity[] {
    // Filter ruangan berdasarkan kapasitas
    const capacitySuitableRooms = rooms.filter(
      (room) => room.capacity >= preferred.participant,
    );
    const sortedRooms = [...capacitySuitableRooms].sort(
      (a, b) =>
        Math.abs(a.capacity - preferred.participant) -
        Math.abs(b.capacity - preferred.participant),
    );

    const recommendations: RecommendationEntity[] = [];

    // Proses setiap ruangan untuk mencari slot yang sesuai
    for (const room of sortedRooms) {
      // Jika sudah mencapai limit rekomendasi, hentikan
      if (recommendations.length >= this.limitRecommend) {
        break;
      }

      const roomRecommendation = this.processRoom(room, preferred);
      if (roomRecommendation) {
        recommendations.push(roomRecommendation);
      }
    }

    return recommendations;
  }

  private processRoom(
    room: RoomEntity,
    preferred: RecommendationDto,
  ): RecommendationEntity | null {
    // Kelompokkan slot berdasarkan tanggal
    const slotsByDate = this.groupSlotsByDate(room.slots);

    // Iterasi melalui preferensi tanggal pengguna
    for (const prefSlot of preferred.slots) {
      const prefDate = new Date(prefSlot.date).toISOString().split('T')[0];
      const roomSlotsOnDate = slotsByDate[prefDate];

      if (!roomSlotsOnDate) continue;

      // Filter slot yang tersedia dan mulai >= waktu mulai yang diinginkan
      const availableSlots = roomSlotsOnDate.filter(
        (slot) => !slot.isBooked && slot.startTime >= prefSlot.startTime,
      );

      // Urutkan berdasarkan waktu mulai
      availableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      // Cari slot berurutan yang sesuai dengan jumlah slot yang dibutuhkan
      const consecutiveSlots = this.findConsecutiveSlots(
        availableSlots,
        preferred.slots.length,
      );

      if (consecutiveSlots.length === preferred.slots.length) {
        return {
          roomId: room.id,
          roomName: room.name,
          roomDate: consecutiveSlots[0].date.toISOString().split('T')[0],
          slots: consecutiveSlots,
        };
      }
    }

    return null;
  }

  private groupSlotsByDate(slots: any[]): Record<string, any[]> {
    const result: Record<string, any[]> = {};

    for (const slot of slots) {
      const dateStr = new Date(slot.date).toISOString().split('T')[0];
      if (!result[dateStr]) {
        result[dateStr] = [];
      }
      result[dateStr].push(slot);
    }

    return result;
  }

  private findConsecutiveSlots(slots: any[], count: number): any[] {
    let start = 0;
    let end = 0;
    let currentSlots: any[] = [];

    while (end < slots.length) {
      if (currentSlots.length === count) return currentSlots;

      if (
        currentSlots.length === 0 ||
        currentSlots[currentSlots.length - 1].endTime === slots[end].startTime
      ) {
        currentSlots.push(slots[end]);
        end++;
      } else {
        start++;
        end = start;
        currentSlots = [];
      }
    }

    return [];
  }
}
