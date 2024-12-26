// src/utils/errors.ts

export class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  }
  
  export class ServiceError extends Error {
    constructor(message: string, public originalError?: Error) {
      super(message);
      this.name = 'ServiceError';
    }
  }
  
  export class DatabaseError extends Error {
    constructor(message: string, public originalError?: Error) {
      super(message);
      this.name = 'DatabaseError';
    }
  }