import { Prisma } from "@prisma/client";
import { UsersRepository } from "../users-repository";
import { prisma } from "../../lib/prisma";
import { UserNotFoundError } from "../../use-cases/errors/user-not-found-error";
import { UserAlreadyDeletedError } from "../../use-cases/errors/user-already-deleted-error";

export class PrismaUsersRepository implements UsersRepository {
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  async findByUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    return user;
  }

  async findByGoogleId(googleId: string) {
    const user = await prisma.user.findUnique({
      where: {
        googleId,
      },
    });

    return user;
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    });

    return user;
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    });

    return user;
  }

  async softDelete(id: string) {
    // First check if user exists
    const user = await this.findById(id);
    
    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.deletedAt) {
      throw new UserAlreadyDeletedError();
    }

    const deletedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return deletedUser;
  }
}
