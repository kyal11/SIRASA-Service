import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/config/redis/redis.service';

@WebSocketGateway({ path: '/socket.io/' })
export class BaseWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      const isBlacklisted = await this.redisService.get(`blacklist:${token}`);
      if (isBlacklisted) {
        client.disconnect();
        return;
      }

      client.data.userId = decoded.userId;
      client.join(`user-${decoded.userId}`);

      console.log(`User ${decoded.userId} connected to WebSocket`);
    } catch (error) {
      console.error('WebSocket auth failed:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`User ${client.data.userId} disconnected from WebSocket`);
  }
}
