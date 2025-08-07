// In-memory store for user online status
class UserStatusStore {
  private userLastSeen: Map<string, Date> = new Map();
  private readonly ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

  updateLastSeen(userId: string): void {
    this.userLastSeen.set(userId, new Date());
  }

  isUserOnline(userId: string): boolean {
    const lastSeen = this.userLastSeen.get(userId);
    if (!lastSeen) return false;
    
    const now = new Date();
    const timeDiff = now.getTime() - lastSeen.getTime();
    return timeDiff < this.ONLINE_THRESHOLD_MS;
  }

  getUserLastSeen(userId: string): Date | null {
    return this.userLastSeen.get(userId) || null;
  }

  getAllOnlineUsers(): string[] {
    const onlineUsers: string[] = [];
    const now = new Date();
    
    for (const [userId, lastSeen] of this.userLastSeen.entries()) {
      const timeDiff = now.getTime() - lastSeen.getTime();
      if (timeDiff < this.ONLINE_THRESHOLD_MS) {
        onlineUsers.push(userId);
      }
    }
    
    return onlineUsers;
  }

  // Clean up old entries periodically (optional)
  cleanup(): void {
    const now = new Date();
    const cutoffTime = now.getTime() - (this.ONLINE_THRESHOLD_MS * 2); // Keep for 10 minutes
    
    for (const [userId, lastSeen] of this.userLastSeen.entries()) {
      if (lastSeen.getTime() < cutoffTime) {
        this.userLastSeen.delete(userId);
      }
    }
  }
}

// Export singleton instance
export const userStatusStore = new UserStatusStore();

// Optional: Run cleanup every 10 minutes
setInterval(() => {
  userStatusStore.cleanup();
}, 10 * 60 * 1000);
