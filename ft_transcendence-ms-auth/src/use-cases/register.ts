import { hash } from "bcryptjs";
import { User } from "@prisma/client";
import { UsersRepository } from "../repositories/users-repository";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

interface RegisterUseCaseRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterUseCaseResponse {
  user: User;
}

export class RegisterUseCase {
  // Use dependency injection to pass the repository
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    username,
    email,
    password,
  }: RegisterUseCaseRequest): Promise<RegisterUseCaseResponse> {
    // check if email already exists
    const userWithSameEmail = await this.usersRepository.findByEmail(email);

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError();
    }

    // check if username already exists
    const userWithSameUsername =
      await this.usersRepository.findByUsername(username);

    if (userWithSameUsername) {
      throw new UserAlreadyExistsError();
    }
    // Hash the password. 6 is the salt rounds
    // TODO: store the salt rounds in an environment variable
    const password_hash = await hash(password, 6);

    // Create the user in the databasa
    const user = await this.usersRepository.create({
      username,
      email,
      password: password_hash,
    });

    return {
      user,
    };
  }
}
