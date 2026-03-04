/**
 * Contract Tests: POST /api/auth/register
 * 
 * Tests user registration endpoint with validation rules
 */

import { POST as registerHandler } from '../../app/api/auth/register/route';
import User from '../../models/User';

jest.mock('../../lib/db');
jest.mock('../../models/User');

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully register user with valid credentials', async () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'SecurePass123',
      fullName: 'John Doe',
    };

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: userData.email,
      fullName: userData.fullName,
      toPublicJSON: () => ({
        _id: '507f1f77bcf86cd799439011',
        email: userData.email,
        fullName: userData.fullName,
      }),
    };

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser);

    const mockRequest = {
      json: jest.fn().mockResolvedValue(userData),
      cookies: { set: jest.fn() },
    };

    const response = await registerHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(201);
    expect(jsonData.success).toBe(true);
    expect(jsonData.data.user.email).toBe(userData.email);
  });

  it('should reject registration with duplicate email', async () => {
    const userData = {
      email: 'existing@example.com',
      password: 'SecurePass123',
      fullName: 'John Doe',
    };

    User.findOne.mockResolvedValue({ email: userData.email });

    const mockRequest = {
      json: jest.fn().mockResolvedValue(userData),
    };

    const response = await registerHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(409);
    expect(jsonData.success).toBe(false);
  });

  it('should reject registration with missing email', async () => {
    const userData = {
      password: 'SecurePass123',
      fullName: 'John Doe',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(userData),
    };

    const response = await registerHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
  });

  it('should reject registration with missing password', async () => {
    const userData = {
      email: 'user@example.com',
      fullName: 'John Doe',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(userData),
    };

    const response = await registerHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
  });

  it('should reject registration with invalid email format', async () => {
    const userData = {
      email: 'not-an-email',
      password: 'SecurePass123',
      fullName: 'John Doe',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(userData),
    };

    const response = await registerHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
  });

  it('should reject weak password', async () => {
    const userData = {
      email: 'user@example.com',
      password: 'weak',
      fullName: 'John Doe',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(userData),
    };

    const response = await registerHandler(mockRequest);
    const jsonData = await response.json();

    expect(response.status).toBe(400);
    expect(jsonData.success).toBe(false);
  });
});
