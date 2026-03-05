export abstract class BaseError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DomainError extends BaseError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 404);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}
