import { CustomError } from './customError.js';

export class DatabaseConnectionError extends CustomError {
  constructor() {
    super('Error connecting to database');
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  // Implement the abstract-like getter
  get statusCode() {
    return 500;
  }

  // Implement the abstract-like method
  serializeErrors() {
    return [{ message: 'Error connecting to database' }];
  }
}