import { Prisma, User } from "@prisma/client";

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  softDelete(id: string): Promise<User>;
}
