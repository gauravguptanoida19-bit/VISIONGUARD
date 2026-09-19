import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { StorageRepository } from '../repositories/storage';
import { config } from '../config';
import { UserRole } from '@visionguard/shared';

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      }

      const existing = await StorageRepository.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, config.jwt.bcryptRounds);
      const validRole: UserRole = ['admin', 'analyst', 'viewer'].includes(role) ? role : 'viewer';

      const newUser = await StorageRepository.createUser({
        id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role: validRole,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
        passwordHash,
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: newUser,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
      }

      const userRecord = await StorageRepository.getUserByEmail(email);
      if (!userRecord) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      }

      const isMatch = await bcrypt.compare(password, userRecord.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      }

      const { passwordHash, ...safeUser } = userRecord;
      const token = jwt.sign(
        { id: safeUser.id, email: safeUser.email, role: safeUser.role, name: safeUser.name },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn as any }
      );

      return res.json({
        success: true,
        message: 'Sign-in successful.',
        token,
        user: safeUser,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authenticated.' });
      }

      const user = await StorageRepository.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User record not found.' });
      }

      return res.json({ success: true, user });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async listUsers(req: Request, res: Response) {
    try {
      const users = await StorageRepository.getUsers();
      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!['admin', 'analyst', 'viewer'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified.' });
      }

      const updated = await StorageRepository.updateUserRole(id, role as UserRole);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      return res.json({ success: true, user: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};
