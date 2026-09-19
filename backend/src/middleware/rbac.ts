import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@visionguard/shared';

// Role hierarchy: admin (level 3) > analyst (level 2) > viewer (level 1)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  analyst: 2,
  viewer: 1,
};

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for this action.',
      });
    }

    const userRole = req.user.role;
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    // Also allow if user has higher permission than the minimal required role in allowedRoles
    const minRequiredLevel = Math.min(...allowedRoles.map((r) => ROLE_HIERARCHY[r] || 0));
    const userLevel = ROLE_HIERARCHY[userRole] || 0;

    if (userLevel >= minRequiredLevel) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access forbidden: Role '${userRole}' lacks permission. Required role: ${allowedRoles.join(' or ')}`,
    });
  };
}
