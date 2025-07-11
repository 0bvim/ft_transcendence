export class UserAlreadyDeletedError extends Error {
  constructor() {
    super("User is already deleted");
  }
} 