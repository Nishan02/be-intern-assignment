import { Request, Response, NextFunction } from 'express';

/**
 * Custom Middleware to simulate authentication.
 * It expects an 'x-user-id' header to identify the current user.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ 
      message: 'Authentication required. Please provide x-user-id in headers.' 
    });
  }

  // Attach the userId to the request object so controllers can use it
  (req as any).userId = parseInt(userId as string, 10);

  next();
};