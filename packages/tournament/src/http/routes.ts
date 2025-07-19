import { FastifyInstance } from "fastify";
import { createTournament } from "./controllers/create-tournament";
import { getTournaments } from "./controllers/get-tournaments";
import { getTournament } from "./controllers/get-tournament";
import { joinTournament } from "./controllers/join-tournament";
import { startTournament } from "./controllers/start-tournament";
import { submitMatchResult } from "./controllers/submit-match-result";
import { getUserStats } from "./controllers/get-user-stats";
import { env } from "../env";

export async function appRoutes(app: FastifyInstance) {
  // Debug endpoint - remove in production
  app.get("/debug/config", async (request, reply) => {
    return reply.status(200).send({
      environment: process.env.NODE_ENV,
      cors_configured: true,
      database_url: env.DATABASE_URL,
      auth_service_url: env.AUTH_SERVICE_URL,
      game_service_url: env.GAME_SERVICE_URL,
      port: env.PORT,
    });
  });

  // Tournament management routes
  app.post("/tournaments", createTournament);
  app.get("/tournaments", getTournaments);
  app.get("/tournaments/:id", getTournament);
  app.post("/tournaments/:id/join", joinTournament);
  app.post("/tournaments/:id/start", startTournament);
  
  // Match management routes
  app.post("/matches/:id/result", submitMatchResult);
  
  // User stats routes
  app.get("/users/:id/stats", getUserStats);
  
  // Tournament status routes
  app.get("/tournaments/:id/matches", async (request, reply) => {
    const { id } = request.params as { id: string };
    // TODO: Implement get tournament matches
    return reply.status(200).send({ tournamentId: id, matches: [] });
  });
  
  app.get("/tournaments/:id/participants", async (request, reply) => {
    const { id } = request.params as { id: string };
    // TODO: Implement get tournament participants
    return reply.status(200).send({ tournamentId: id, participants: [] });
  });
}
