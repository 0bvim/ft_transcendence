import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../env";

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Auth header:", authHeader);
    console.log("Token:", token ? "present" : "missing");

    if (!token) {
      console.log("No token provided");
      return reply.status(401).send({ error: "Access token required" });
    }

    console.log("JWT_SECRET available:", !!env.JWT_SECRET);
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    console.log("Token decoded successfully:", decoded);
    
    request.user = {
      id: decoded.sub || decoded.id || decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
  } catch (error) {
    console.log("JWT verification failed:", error);
    return reply.status(403).send({ error: "Invalid or expired token" });
  }
}
