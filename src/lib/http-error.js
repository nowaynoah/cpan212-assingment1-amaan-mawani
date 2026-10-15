// Throw one of these and the error handler turns it into the JSON error shape
// with this status code.
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
