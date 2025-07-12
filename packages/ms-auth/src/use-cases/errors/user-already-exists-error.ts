export class UserAlreadyExistsError extends Error {
  constructor() {
    // 'super' calls the constructor of the parent class (Error)
    super("E-mail or username already exists.");
  }
}
