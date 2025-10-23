import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey', { ignoreNotBefore: true, clockTolerance: 300 }); // ignore iat check
    console.log('Decoded token:', decoded);

    let user;
    if (decoded.id) {
      user = await prisma.user.findUnique({
        where: { user_id: decoded.id }
      });
    } else if (decoded.email) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email }
      });
    }

    if (!user) {
      console.log('User not found for token:', decoded);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.user_id,
      email: user.email,
      role: user.role
    };
    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user has required role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};