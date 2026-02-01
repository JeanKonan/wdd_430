import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for authenticated user
 * @param {Object} payload - User data to encode in token (e.g., { userId, email })
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  if (!payload || !payload.userId) {
    throw new Error('User ID is required to generate token');
  }

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token and decode payload
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password with hashed password
 * @param {string} candidatePassword - Plain text password to verify
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(candidatePassword, hashedPassword) {
  return bcrypt.compare(candidatePassword, hashedPassword);
}

/**
 * Extract token from Authorization header or cookies
 * @param {Object} request - Next.js request object
 * @returns {string|null} JWT token or null
 */
export function extractToken(request) {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookies = request.cookies;
  if (cookies.get('token')) {
    return cookies.get('token').value;
  }

  return null;
}

/**
 * Verify user is authenticated from request
 * @param {Object} request - Next.js request object
 * @returns {Promise<Object>} Decoded user payload
 * @throws {Error} If token is missing or invalid
 */
export async function authenticateRequest(request) {
  const token = extractToken(request);

  if (!token) {
    throw new Error('Authentication required');
  }

  const decoded = verifyToken(token);
  return decoded;
}
