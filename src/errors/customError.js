export class CustomError extends Error {
    constructor(message) {
      super(message);
      if (this.constructor === CustomError) {
        throw new Error("Cannot instantiate abstract class CustomError");
      }
      Object.setPrototypeOf(this, CustomError.prototype);
    }
  
    get statusCode() {
      throw new Error("Abstract property 'statusCode' must be implemented in subclass");
    }
  
    serializeErrors() {
      throw new Error("Abstract method 'serializeErrors' must be implemented in subclass");
    }
  }