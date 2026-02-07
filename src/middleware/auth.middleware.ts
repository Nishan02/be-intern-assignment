import { Request, Response, NextFunction } from 'express';

// Simple auth check - expects 'x-user-id' for local dev/testing
export const auth = (req: Request, res: Response, next: NextFunction) => {
  const uid = req.headers['x-user-id'];

  if (!uid) {
    return res.status(401).json({ 
      error: 'Missing x-user-id header' 
    });
  }

  // Cast to number and attach to request for controller access
  // Using + prefix is a common shorthand for parseInt
  (req as any).userId = +uid;

  next();
};