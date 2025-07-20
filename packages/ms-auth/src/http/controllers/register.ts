import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { RegisterUseCase } from "../../use-cases/register";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { UserAlreadyExistsError } from "../../use-cases/errors/user-already-exists-error";

export async function register(request: FastifyRequest, reply: FastifyReply) {
  // NOTE: Define the expected request body schema using ZOD
  const registerBodySchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
  });

  try {
    request.log.info('Registration attempt received:', { 
      body: request.body, 
      headers: request.headers 
    });

    // NOTE: Parse and validate the request body against the schema
    const { username, email, password } = registerBodySchema.parse(request.body);

    request.log.info('Registration request parsed successfully:', { username, email });

    const usersRepository = new PrismaUsersRepository();
    const registerUseCase = new RegisterUseCase(usersRepository);

    await registerUseCase.execute({
      username,
      email,
      password,
    });

    request.log.info('User registered successfully:', { username, email });
  } catch (err) {
    request.log.error('Registration error:', err);
    
    if (err instanceof UserAlreadyExistsError) {
      return reply
        .status(409)
        .send({ error: "Email or username already in use." });
    }

    if (err instanceof z.ZodError) {
      request.log.error('Validation error:', err.format());
      return reply
        .status(400)
        .send({ error: "Invalid input data", details: err.format() });
    }

    throw err; // Re-throw the error if it's not a UserAlreadyExistsError
  }

  return reply.status(201).send();
}
