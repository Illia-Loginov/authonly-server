import type { RequestHandler, Request } from 'express';
import {
  createResource,
  deleteResource,
  editResource,
  getResources
} from '../services/resources/resources.service.js';

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

export const getResourcesHandler: RequestHandler = async (req, res, next) => {
  try {
    const resources = await getResources(req.query);

    res.status(200).json({ resources });
  } catch (error) {
    next(error);
  }
};

export const deleteResourceHandler: RequestHandler = async (
  req: Request & { user?: any },
  res,
  next
) => {
  try {
    const deletedResource = await deleteResource(req.params, req.user);

    res.status(200).json({ resource: deletedResource });
  } catch (error) {
    next(error);
  }
};

export const editResourceHandler: RequestHandler = async (
  req: Request & { user?: any },
  res,
  next
) => {
  try {
    const resource = await editResource(req.body, req.params, req.user);

    res.status(200).json({ resource });
  } catch (error) {
    next(error);
  }
};
