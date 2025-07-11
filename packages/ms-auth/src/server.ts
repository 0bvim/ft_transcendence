import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import { appRoutes } from "./http/routes";
import { ZodError } from "zod";
import { env } from "./env";

const app = fastify({ logger: true });

// Register CORS plugin - Accept all origins for development
app.register(fastifyCors, {
  origin: true, // Accept all origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
});

app.register(appRoutes);

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    // when error come from Zod, it's a validation error
    return reply
      .status(400)
      .send({ message: "Validation error", issues: error.format() });
  }

  // For other errors, we log them and return a generic error message
  app.log.error(error);

  return reply.status(500).send({ message: "Internal Server error." });
});

const start = async () => {
  try {
    await app.listen({
      port: env.PORT ? Number(process.env.PORT) : 4242,
      host: "0.0.0.0",
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
