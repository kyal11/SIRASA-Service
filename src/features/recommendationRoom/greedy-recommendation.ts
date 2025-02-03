import { RoomEntity } from 'src/models/room/serialization/room.entity';
import { RecommendationDto } from './validation/recommendation.dto';
import { RecommendationEntity } from './serilization/recommendation.entity';

export class GreedyRecommendation {
  private limitRecommend: number = 3;

  recommend(
    preferred: RecommendationDto,
    rooms: RoomEntity[],
  ): RecommendationEntity[] {
    let recommendations: RecommendationEntity[] = [];

    // Filter ruangan yang memiliki kapasitas cukup
    const suitableRooms = rooms.filter(
      (room) => room.capacity >= preferred.participant,
    );

    console.log('suitableRooms', suitableRooms);
    // Filter ruangan yang memiliki slot yang cocok dengan preferensi
    const matchingRooms = suitableRooms.filter((room) =>
      room.slots.some((slot) =>
        preferred.slots.some(
          (prefSlot) => slot.startTime === prefSlot.startTime && !slot.isBooked,
        ),
      ),
    );

    // Mencari rekomendasi pertama berdasarkan kecocokan slot
    recommendations = this.prepareRecommendations(matchingRooms, preferred);

    console.log('recommendations', recommendations);
    // Jika sudah mencapai limit, langsung return
    if (recommendations.length >= this.limitRecommend) {
      return recommendations;
    }

    // Jika masih kurang, cari alternatif ruangan dengan slot kosong
    const alternativeRooms = suitableRooms.filter((room) =>
      room.slots.some((slot) => !slot.isBooked),
    );

    // Tambahkan rekomendasi dari ruangan alternatif
    recommendations.push(
      ...this.prepareRecommendations(alternativeRooms, preferred),
    );

    // Pastikan rekomendasi tidak melebihi limit
    return recommendations;
  }

  private prepareRecommendations(
    rooms: RoomEntity[],
    preferred: RecommendationDto,
  ): RecommendationEntity[] {
    const recommendations: RecommendationEntity[] = [];

    for (const room of rooms) {
      // Jika sudah mencapai batas rekomendasi, hentikan pencarian
      if (recommendations.length >= this.limitRecommend) {
        return recommendations;
      }

      // Cari slot yang tersedia dan cocok dengan preferensi
      let availableSlots = room.slots.filter(
        (slot) =>
          !slot.isBooked &&
          preferred.slots.some(
            (prefSlot) => slot.startTime >= prefSlot.startTime,
          ),
      );
      // Urutkan slot berdasarkan startTime
      availableSlots = availableSlots.sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      console.log(availableSlots);
      // Pilih hanya slot yang berurutan
      const consecutiveSlots: typeof availableSlots = [];
      for (let i = 0; i < availableSlots.length; i++) {
        if (consecutiveSlots.length === 0) {
          // Tambahkan slot pertama ke daftar
          consecutiveSlots.push(availableSlots[i]);
        } else {
          // Pastikan slot ini berurutan dengan slot sebelumnya
          const prevSlot = consecutiveSlots[consecutiveSlots.length - 1];
          if (prevSlot.endTime === availableSlots[i].startTime) {
            consecutiveSlots.push(availableSlots[i]);
          } else {
            break; // Jika tidak berurutan, hentikan pengambilan lebih lanjut
          }
        }

        // Jika sudah cukup sesuai jumlah slot preferensi, berhenti
        if (consecutiveSlots.length === preferred.slots.length) {
          break;
        }
      }

      // Jika ada slot berurutan yang sesuai dengan preferensi, tambahkan ke rekomendasi
      if (consecutiveSlots.length === preferred.slots.length) {
        recommendations.push({
          roomId: room.id,
          roomName: room.name,
          roomDate: consecutiveSlots[0].date.toISOString().split('T')[0],
          slots: consecutiveSlots,
        });
      }
    }

    return recommendations;
  }
}
