import { RoomEntity } from 'src/models/room/serialization/room.entity';
import { RecommendationDto } from './validation/recommendation.dto';
import { RecommendationEntity } from './serilization/recommendation.entity';

export class GreedyRecommendation {
  private limitRecommend: number = 3;

  // recommend(
  //   preferred: RecommendationDto,
  //   rooms: RoomEntity[],
  // ): RecommendationEntity[] {
  //   let recommendations: RecommendationEntity[] = [];

  //   // console.log(rooms);
  //   // Filter ruangan yang memiliki kapasitas cukup
  //   const suitableRooms = rooms.filter(
  //     (room) => room.capacity >= preferred.participant,
  //   );

  //   // console.log('suitableRooms', suitableRooms);
  //   // Filter ruangan yang memiliki slot yang cocok dengan preferensi
  //   const matchingRooms = suitableRooms.filter((room) =>
  //     room.slots.some((slot) =>
  //       preferred.slots.some(
  //         (prefSlot) =>
  //           new Date(slot.date).toISOString().split('T')[0] ===
  //             new Date(prefSlot.date).toISOString().split('T')[0] &&
  //           !slot.isBooked,
  //       ),
  //     ),
  //   );

  //   // console.log('matching rooms: ', matchingRooms);
  //   // console.log(matchingRooms.map((room) => room.slots));
  //   // Mencari rekomendasi pertama berdasarkan kecocokan slot
  //   recommendations = this.prepareRecommendations(matchingRooms, preferred);

  //   // console.log('recommendations', recommendations);
  //   // Jika sudah mencapai limit, langsung return
  //   if (recommendations.length >= this.limitRecommend) {
  //     return recommendations;
  //   }

  //   // Jika masih kurang, cari alternatif ruangan dengan slot kosong
  //   // const alternativeRooms = matchingRooms.filter((room) =>
  //   //   room.slots.some((slot) => !slot.isBooked),
  //   // );

  //   // // // Tambahkan rekomendasi dari ruangan alternatif
  //   // recommendations.push(
  //   //   ...this.prepareRecommendations(alternativeRooms, preferred),
  //   // );

  //   // Pastikan rekomendasi tidak melebihi limit
  //   return recommendations;
  // }

  // private prepareRecommendations(
  //   rooms: RoomEntity[],
  //   preferred: RecommendationDto,
  // ): RecommendationEntity[] {
  //   const recommendations: RecommendationEntity[] = [];

  //   for (const room of rooms) {
  //     // Jika sudah mencapai batas rekomendasi, hentikan pencarian
  //     if (recommendations.length >= this.limitRecommend) {
  //       return recommendations;
  //     }

  //     // Cari slot yang tersedia dan cocok dengan preferensi
  //     let availableSlots = room.slots.filter(
  //       (slot) =>
  //         !slot.isBooked &&
  //         preferred.slots.some(
  //           (prefSlot) => slot.startTime >= prefSlot.startTime,
  //         ),
  //     );
  //     console.log(availableSlots);
  //     // Urutkan slot berdasarkan startTime
  //     availableSlots = availableSlots.sort((a, b) =>
  //       a.startTime.localeCompare(b.startTime),
  //     );

  //     console.log('AvaibleSlot:', availableSlots);
  //     // Pilih hanya slot yang berurutan
  //     const consecutiveSlots: typeof availableSlots = [];
  //     for (let i = 0; i < availableSlots.length; i++) {
  //       if (consecutiveSlots.length === 0) {
  //         // Tambahkan slot pertama ke daftar
  //         consecutiveSlots.push(availableSlots[i]);
  //       } else {
  //         // Pastikan slot ini berurutan dengan slot sebelumnya
  //         const prevSlot = consecutiveSlots[consecutiveSlots.length - 1];
  //         if (prevSlot.endTime === availableSlots[i].startTime) {
  //           consecutiveSlots.push(availableSlots[i]);
  //         } else {
  //           break; // Jika tidak berurutan, hentikan pengambilan lebih lanjut
  //         }
  //       }

  //       // Jika sudah cukup sesuai jumlah slot preferensi, berhenti
  //       if (consecutiveSlots.length === preferred.slots.length) {
  //         break;
  //       }
  //     }

  //     // Jika ada slot berurutan yang sesuai dengan preferensi, tambahkan ke rekomendasi
  //     if (consecutiveSlots.length === preferred.slots.length) {
  //       recommendations.push({
  //         roomId: room.id,
  //         roomName: room.name,
  //         roomDate: consecutiveSlots[0].date.toISOString().split('T')[0],
  //         slots: consecutiveSlots,
  //       });
  //     }
  //   }
  //   console.log('rekomendation', recommendations);
  //   return recommendations;
  // }

  recommend(
    preferred: RecommendationDto,
    rooms: RoomEntity[],
  ): RecommendationEntity[] {
    // Filter ruangan berdasarkan kapasitas
    const capacitySuitableRooms = rooms.filter(
      (room) => room.capacity >= preferred.participant,
    );

    // Urutkan ruangan berdasarkan kesesuaian kapasitas (yang paling sesuai di depan)
    const sortedRooms = [...capacitySuitableRooms].sort(
      (a, b) =>
        a.capacity -
        preferred.participant -
        (b.capacity - preferred.participant),
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
    if (slots.length < count) return [];

    for (let i = 0; i <= slots.length - count; i++) {
      const potentialConsecutive = slots.slice(i, i + count);
      let isConsecutive = true;

      for (let j = 1; j < potentialConsecutive.length; j++) {
        if (
          potentialConsecutive[j - 1].endTime !==
          potentialConsecutive[j].startTime
        ) {
          isConsecutive = false;
          break;
        }
      }

      if (isConsecutive) {
        return potentialConsecutive;
      }
    }

    return [];
  }
}
