import type { RequestHandler, Request } from 'express';
import { createResource } from '../services/resources/resources.service.js';

export const createResourceHandler: RequestHandler = async (
  req: Request & { user?: any },
  res,
  next
) => {
  try {
    const resource = await createResource(req.body, req.user);

    res.status(201).json({ resource });
  } catch (error) {
    next(error);
  }
};
