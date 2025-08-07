export class InvalidRefreshTokenError extends Error {
  constructor() {
    super("Refresh token is not valid.");
  }
}
