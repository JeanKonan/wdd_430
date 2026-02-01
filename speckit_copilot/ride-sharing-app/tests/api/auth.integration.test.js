/**
 * Integration Tests: Complete Authentication Workflow
 * 
 * Tests the end-to-end authentication flow:
 * - Register new user
 * - Login with registered credentials
 */

import { POST as registerHandler } from '../../app/api/auth/register/route';
import { POST as loginHandler } from '../../app/api/auth/login/route';
import User from '../../models/User';

jest.mock('../../lib/db');
jest.mock('../../models/User');

describe('Authentication Workflow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete auth workflow: register → login', async () => {
    const testEmail = 'integration@example.com';
    const testPassword = 'TestPass123';
    const testFullName = 'Integration Test User';

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: testEmail,
      fullName: testFullName,
      accountStatus: 'active',
      toPublicJSON: () => ({
        _id: '507f1f77bcf86cd799439011',
        email: testEmail,
        fullName: testFullName,
      }),
    };

    // Step 1: Register
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce(mockUser);

    const registerRequest = {
      json: jest.fn().mockResolvedValue({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
      }),
      cookies: { set: jest.fn() },
    };

    const registerResponse = await registerHandler(registerRequest);
    const registerData = await registerResponse.json();

    expect(registerResponse.status).toBe(201);
    expect(registerData.success).toBe(true);
    expect(registerData.data.user.email).toBe(testEmail);

    // Step 2: Login
    mockUser.comparePassword = jest.fn().mockResolvedValue(true);
    mockUser.isActive = true;
    User.findOne.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const loginRequest = {
      json: jest.fn().mockResolvedValue({
        email: testEmail,
        password: testPassword,
      }),
      cookies: { set: jest.fn() },
    };

    const loginResponse = await loginHandler(loginRequest);
    const loginData = await loginResponse.json();

    expect(loginResponse.status).toBe(200);
    expect(loginData.success).toBe(true);
    expect(loginData.data.token).toBeDefined();
  });

  it('should prevent double registration with same email', async () => {
    const testEmail = 'duplicate@example.com';

    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      email: testEmail,
      fullName: 'Test User',
      toPublicJSON: () => ({ email: testEmail }),
    };

    // First registration succeeds
    User.findOne.mockResolvedValueOnce(null);
    User.create.mockResolvedValueOnce(mockUser);

    const firstRegisterRequest = {
      json: jest.fn().mockResolvedValue({
        email: testEmail,
        password: 'TestPass123',
        fullName: 'Test User',
      }),
      cookies: { set: jest.fn() },
    };

    const firstResponse = await registerHandler(firstRegisterRequest);
    expect(firstResponse.status).toBe(201);

    // Second registration fails
    User.findOne.mockResolvedValueOnce(mockUser);

    const secondRegisterRequest = {
      json: jest.fn().mockResolvedValue({
        email: testEmail,
        password: 'DifferentPass456',
        fullName: 'Different User',
      }),
      cookies: { set: jest.fn() },
    };

    const secondResponse = await registerHandler(secondRegisterRequest);
    const secondData = await secondResponse.json();

    expect(secondResponse.status).toBe(409);
    expect(secondData.success).toBe(false);
  });

  it('should not allow login if user never registered', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const loginRequest = {
      json: jest.fn().mockResolvedValue({
        email: 'never-registered@example.com',
        password: 'TestPass123',
      }),
    };

    const response = await loginHandler(loginRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });
});
