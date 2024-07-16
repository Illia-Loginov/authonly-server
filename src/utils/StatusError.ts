export abstract class StatusError extends Error {
  abstract status: number;
}

export class BadRequestError extends StatusError {
  status = 400;
}

export class UnauthenticatedError extends StatusError {
  status = 401;
}

export class ForbiddenError extends StatusError {
  status = 403;
}

export class NotFoundError extends StatusError {
  status = 404;
}
