import { SubscribeMessage, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { BaseWebSocketGateway } from 'src/base.gateaway';

export class BookingGateway extends BaseWebSocketGateway {
  @SubscribeMessage('joinBookingHistory')
  handleJoinBookingHistory(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    client.join(`user-${userId}`);
    console.log(`User ${userId} joined WebSocket booking history.`);
  }

  sendBookingUpdate(userId: string, bookingData: any) {
    this.server.to(`user-${userId}`).emit('bookingUpdated', bookingData);
  }
}
