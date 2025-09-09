// CODECTI Platform - Authentication Routes

import { Hono } from 'hono';
import type { Bindings, LoginRequest, AuthResponse, User } from '../types';
import { hashPassword, verifyPassword, signJWT, verifyJWT } from '../utils/auth';

const auth = new Hono<{ Bindings: Bindings }>();

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = 'codecti-platform-secret-key-change-in-production';

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const { email, password }: LoginRequest = await c.req.json();

    if (!email || !password) {
      return c.json<AuthResponse>({
        success: false,
        message: 'Email y contraseña son requeridos'
      }, 400);
    }

    // Find user in database
    let user: any;
    if (c.env.DB) {
      user = await c.env.DB.prepare(
        'SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = ? AND is_active = 1'
      ).bind(email).first() as any;
    } else {
      // Use mock database for development
      const { mockDb } = await import('../utils/mockDb');
      user = await mockDb.getUserByEmail(email);
    }

    if (!user) {
      return c.json<AuthResponse>({
        success: false,
        message: 'Credenciales inválidas'
      }, 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json<AuthResponse>({
        success: false,
        message: 'Credenciales inválidas'
      }, 401);
    }

    // Generate JWT token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    }, JWT_SECRET);

    // Return user data (without password) and token
    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      is_active: user.is_active
    };

    return c.json<AuthResponse>({
      success: true,
      user: userData,
      token,
      message: 'Inicio de sesión exitoso'
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json<AuthResponse>({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Verify token endpoint
auth.post('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json<AuthResponse>({
        success: false,
        message: 'Token no proporcionado'
      }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyJWT(token, JWT_SECRET);

    if (!payload) {
      return c.json<AuthResponse>({
        success: false,
        message: 'Token inválido o expirado'
      }, 401);
    }

    // Get user data
    let user: any;
    if (c.env.DB) {
      user = await c.env.DB.prepare(
        'SELECT id, email, name, role, created_at, is_active FROM users WHERE id = ? AND is_active = 1'
      ).bind(payload.userId).first() as any;
    } else {
      // Use mock database for development
      const { mockDb } = await import('../utils/mockDb');
      user = await mockDb.getUserById(payload.userId);
    }

    if (!user) {
      return c.json<AuthResponse>({
        success: false,
        message: 'Usuario no encontrado'
      }, 404);
    }

    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      is_active: user.is_active
    };

    return c.json<AuthResponse>({
      success: true,
      user: userData,
      message: 'Token válido'
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return c.json<AuthResponse>({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Logout endpoint (client-side implementation mainly)
auth.post('/logout', async (c) => {
  return c.json<AuthResponse>({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

export { auth, JWT_SECRET };