import ClientError from './ClientError.js';

class InputError extends ClientError {
  constructor(message, statusCode = 400) {
    // Pass the message and statusCode to the parent constructor
    super(message, statusCode);
    this.name = 'InputError';  // Set the name to 'InputError'
  }
}

export { InputError }; 