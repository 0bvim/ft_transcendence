import { it, describe, expect, beforeEach } from "vitest";
import { InMemoryUsersRepository } from "./in-memory/in-memory-users-repository";
import { RegisterUseCase } from "../use-cases/register";
import { UserAlreadyExistsError } from "../use-cases/errors/user-already-exists-error";

describe("Register Use Case", () => {
  let usersRepository: InMemoryUsersRepository;
  let registerUseCase: RegisterUseCase;

  beforeEach(() => {
    // For each test, we get a fresh, new in-memory repository
    usersRepository = new InMemoryUsersRepository();
    // And we instantiate the use case with that new repository
    registerUseCase = new RegisterUseCase(usersRepository);
  });

  // 'it' is the test itself
  it("should be able to register a new user", async () => {
    const { user } = await registerUseCase.execute({
      username: "John Doe",
      email: "johndoe@example.com",
      password: "password123",
    });

    // 'expect; is the assertion
    expect(user.id).toEqual(expect.any(String));
    expect(user.username).toEqual("John Doe");
  });

  it("should not be able to register with a duplicate email", async () => {
    const email = "johndoe@example.com";

    // Create a user with email above
    await registerUseCase.execute({
      username: "John Doe",
      email: email,
      password: "password123",
    });

    // 'expect; is the assertion
    await expect(() =>
      registerUseCase.execute({
        username: "Jane Doe",
        email: email,
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it("should not be able to register with a duplicated username", async () => {
    const username = "ginoegeno";

    await registerUseCase.execute({
      username: username,
      email: "anymail@gmail.com",
      password: "password123",
    });

    await expect(() =>
      registerUseCase.execute({
        username: username,
        email: "meio-meio@gemei.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
