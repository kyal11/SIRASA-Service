import { Exclude, Expose } from 'class-transformer';

export class AuthEntity {
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

  @Expose()
  loginResponse(jwtToken: string, refreshToken: string): object {
    return {
      email: this.email,
      nim: this.nim,
      name: this.name,
      token: jwtToken,
      refresh_token: refreshToken,
    };
  }

  @Expose()
  registerResponse(): object {
    return {
      email: this.email,
      name: this.name,
      nim: this.nim,
      phone_number: this.phone_number,
      verified: this.verified,
      role: this.role,
      image_url: this.image_url,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
