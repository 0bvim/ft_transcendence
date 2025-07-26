import { FastifyInstance } from "fastify";
import { createTournament } from "./controllers/create-tournament";
import { getTournaments } from "./controllers/get-tournaments";
import { getTournament } from "./controllers/get-tournament";
import { joinTournament } from "./controllers/join-tournament";
import { startTournament } from "./controllers/start-tournament";
import { submitMatchResult } from "./controllers/submit-match-result";
import { getMatchDetails } from "./controllers/get-match-details";
import { getUserStats } from "./controllers/get-user-stats";
import { env } from "../env";

export async function appRoutes(app: FastifyInstance) {
  app.register(async function publicRoutes(app) {
    // Tournament routes
    app.post('/tournaments', createTournament);
    app.get('/tournaments', getTournaments);
    app.get('/tournaments/:id', getTournament);
    app.post('/tournaments/:id/join', joinTournament);
    app.post('/tournaments/:id/start', startTournament);
    app.post('/matches/:id/result', submitMatchResult);
    app.get('/matches/:id', getMatchDetails); // Add the match details route
    app.get('/users/:id/stats', getUserStats);
  });

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
