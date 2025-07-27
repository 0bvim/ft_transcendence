import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RegisterUseCase } from "../../use-cases/register";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { UserAlreadyExistsError } from "../../use-cases/errors/user-already-exists-error";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
  });

  try {
    console.log("Registration attempt received:", {
      body: request.body,
      headers: request.headers,
    });

    const { username, email, password } = registerBodySchema.parse(
      request.body,
    );

    console.log("Registration request parsed successfully:", {
      username,
      email,
    });

    const usersRepository = new PrismaUsersRepository();
    const registerUseCase = new RegisterUseCase(usersRepository);

    await registerUseCase.execute({
      username,
      email,
      password,
    });

    console.log("User registered successfully:", { username, email });
  } catch (err) {
    console.error("Registration error:", err);

    if (err instanceof UserAlreadyExistsError) {
      return reply
        .status(409)
        .send({ error: "Email or username already in use." });
    }

    if (err instanceof z.ZodError) {
      console.error("Validation error:", err.format());
      return reply
        .status(400)
        .send({ error: "Invalid input data", details: err.format() });
    }

    throw err;
  }

  return reply.status(201).send();
}
