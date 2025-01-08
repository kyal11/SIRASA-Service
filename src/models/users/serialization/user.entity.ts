import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  name: string;
  email: string;
  @Exclude()
  password: string;
  nim: string;
  phone_number: string;
  verified: boolean;
  role: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}
