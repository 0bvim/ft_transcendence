interface SessionData {
  challenge: string;
  userId?: string;
  type: 'registration' | 'authentication';
  createdAt: Date;
  expiresAt: Date;
}

class SessionStore {
  private sessions: Map<string, SessionData> = new Map();

  set(sessionId: string, data: Omit<SessionData, 'createdAt' | 'expiresAt'>): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    this.sessions.set(sessionId, {
      ...data,
      createdAt: now,
      expiresAt,
    });
  }

  get(sessionId: string): SessionData | undefined {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return undefined;
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return undefined;
    }

    return session;
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanup(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

export const sessionStore = new SessionStore();

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  sessionStore.cleanup();
}, 10 * 60 * 1000); 