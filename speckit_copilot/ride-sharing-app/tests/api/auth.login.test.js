/**
 * Contract Tests: POST /api/auth/login
 * 
 * Tests user login endpoint with various credential combinations
 */

import { POST as loginHandler } from '../../app/api/auth/login/route';
import User from '../../models/User';

jest.mock('../../lib/db');
jest.mock('../../models/User');

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login user with valid credentials', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'SecurePass123',
    };

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      fullName: 'John Doe',
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(true),
      toPublicJSON: () => ({
        _id: '507f1f77bcf86cd799439011',
        email: 'user@example.com',
        fullName: 'John Doe',
      }),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue(credentials),
      cookies: { set: jest.fn() },
    };

    const response = await loginHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(200);
    expect(jsonData.success).toBe(true);
    expect(jsonData.data.token).toBeDefined();
  });

  it('should reject login with invalid password', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'WrongPassword123',
    };

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(false),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue(credentials),
    };

    const response = await loginHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(401);
    expect(jsonData.success).toBe(false);
  });

  it('should reject login with non-existent email', async () => {
    const credentials = {
      email: 'nonexistent@example.com',
      password: 'SecurePass123',
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue(credentials),
    };

    const response = await loginHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(401);
    expect(jsonData.success).toBe(false);
  });

  it('should reject login with missing email', async () => {
    const credentials = {
      password: 'SecurePass123',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(credentials),
    };

    const response = await loginHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
  });

  it('should reject login with missing password', async () => {
    const credentials = {
      email: 'user@example.com',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(credentials),
    };

    const response = await loginHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
  });

  it('should reject login for suspended accounts', async () => {
    const credentials = {
      email: 'user@example.com',
      password: 'SecurePass123',
    };

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: 'user@example.com',
      isActive: false,
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue(credentials),
    };

    const response = await loginHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(403);
    expect(jsonData.success).toBe(false);
  });
});
