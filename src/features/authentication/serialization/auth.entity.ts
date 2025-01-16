import { Exclude, Expose } from 'class-transformer';

export class AuthEntity {
  id: string;
  name: string;
  email: string;
  @Exclude()
  password: string;
  nim: string;
  phoneNumber: string;
  verified: boolean;
  role: string;
  imageUrl?: string;
  created_at: Date;
  updated_at: Date;

  @Expose()
  loginResponse(jwtToken: string): object {
    return {
      email: this.email,
      nim: this.nim,
      name: this.name,
      token: jwtToken,
    };
  }

  @Expose()
  registerResponse(): object {
    return {
      email: this.email,
      name: this.name,
      nim: this.nim,
      phoneNumber: this.phoneNumber,
      verified: this.verified,
      role: this.role,
      imageUrl: this.imageUrl,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
