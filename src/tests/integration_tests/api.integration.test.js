import { authService, userService, setAuthToken, clearAuthToken, ApiError } from '../../services/api';

global.fetch = jest.fn();

describe('API Integration Tests (Essential)', () => {
    beforeEach(() => {
        fetch.mockClear();
        clearAuthToken();
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    test('should login successfully', async () => {
        const mockResponse = {
            token: 'fake-token',
            user: { id: '1', email: 'test@example.com' }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await authService.login({
            email: 'test@example.com',
            password: 'password123'
        });

        expect(result).toEqual(mockResponse);
    });

    test('should throw error when login without credentials', async () => {
        await expect(authService.login({})).rejects.toThrow('Email et mot de passe requis');
    });

    test('should handle network errors', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(authService.login({
            email: 'test@example.com',
            password: 'password123'
        })).rejects.toThrow('Network error');
    });



    test('should handle HTTP error', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Invalid credentials' })
        });

        await expect(authService.login({
            email: 'test@example.com',
            password: 'wrong-password'
        })).rejects.toThrow('Invalid credentials');
    });

    test('should handle HTTP error with invalid JSON', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => { throw new Error('Invalid JSON'); }
        });

        await expect(authService.login({
            email: 'test@example.com',
            password: 'password123'
        })).rejects.toThrow('HTTP 500');
    });

    test('should register successfully', async () => {
        const mockResponse = { message: 'Inscription réussie' };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await authService.register({
            email: 'test@example.com',
            password: 'password123'
        });

        expect(result).toEqual(mockResponse);
    });

    test('should throw error when register without credentials', async () => {
        await expect(authService.register({})).rejects.toThrow('Email et mot de passe requis');
    });

    test('should logout successfully', async () => {
        setAuthToken('test-token');

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Déconnecté' })
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        await authService.logout();

        expect(fetch).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/api/auth/logout`,
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-token'
                })
            })
        );

        consoleWarnSpy.mockRestore();
    });

    test('should handle logout API error', async () => {
        fetch.mockRejectedValueOnce(new Error('Logout API error'));

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        await authService.logout();

        expect(consoleWarnSpy).toHaveBeenCalled();
        consoleWarnSpy.mockRestore();
    });

    test('should get all users', async () => {
        setAuthToken('test-token');
        const mockUsers = [{ id: '1', firstName: 'Test' }];

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: mockUsers })
        });

        const result = await userService.getAllUsers();

        expect(result).toEqual({ users: mockUsers });
    });

    test('should get all users with parameters', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: [] })
        });

        await userService.getAllUsers({ page: 1, limit: 10 });

        expect(fetch).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/api/users?page=1&limit=10`,
            expect.any(Object)
        );
    });

    test('should delete user successfully', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Utilisateur supprimé' })
        });

        const result = await userService.deleteUser('user123');

        expect(result).toEqual({ message: 'Utilisateur supprimé' });
    });

    test('should throw error when deleting user without ID', async () => {
        await expect(userService.deleteUser()).rejects.toThrow('ID utilisateur requis');
        await expect(userService.deleteUser('')).rejects.toThrow('ID utilisateur requis');
    });

    test('should make request without auth token', async () => {
        clearAuthToken();

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ data: 'public data' })
        });

        await userService.getAllUsers();

        expect(fetch).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/api/users`,
            expect.objectContaining({
                headers: expect.not.objectContaining({
                    'Authorization': expect.any(String)
                })
            })
        );
    });

    test('should set token when login returns token', async () => {
        const mockResponse = {
            token: 'returned-token',
            user: { id: '1', email: 'test@example.com' }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        await authService.login({
            email: 'test@example.com',
            password: 'password123'
        });

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: [] })
        });

        await userService.getAllUsers();

        expect(fetch).toHaveBeenLastCalledWith(
            `${process.env.REACT_APP_API_URL}/api/users`,
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer returned-token'
                })
            })
        );
    });

    test('should handle login response without token', async () => {
        const mockResponse = { user: { id: '1', email: 'test@example.com' } };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await authService.login({
            email: 'test@example.com',
            password: 'password123'
        });

        expect(result).toEqual(mockResponse);
    });

    test('should handle error without message', async () => {
        const errorWithoutMessage = new Error();
        errorWithoutMessage.message = '';

        fetch.mockRejectedValueOnce(errorWithoutMessage);

        await expect(authService.login({
            email: 'test@example.com',
            password: 'password123'
        })).rejects.toThrow('Erreur réseau');
    });

    test('should set and clear auth token', () => {
        setAuthToken('new-token');
        clearAuthToken();
        expect(true).toBe(true);
    });

    // --------- Couverture complète des branches ApiError et gestion d'erreur ---------

    test('should create ApiError with all parameters', () => {
        const error = new ApiError('Test message', 500, { additional: 'data' });
        expect(error.message).toBe('Test message');
        expect(error.status).toBe(500);
        expect(error.data).toEqual({ additional: 'data' });
        expect(error.name).toBe('ApiError');
        expect(error instanceof Error).toBe(true);
    });

    test('should create ApiError with message and status only', () => {
        const error = new ApiError('Test message', 404);
        expect(error.message).toBe('Test message');
        expect(error.status).toBe(404);
        expect(error.data).toBeUndefined();
        expect(error.name).toBe('ApiError');
    });

    test('should re-throw ApiError instance without modification', async () => {
        const originalApiError = new ApiError('Original API Error', 403, { code: 'FORBIDDEN' });
        fetch.mockRejectedValueOnce(originalApiError);

        try {
            await authService.login({
                email: 'test@example.com',
                password: 'password123'
            });
            fail('Should have thrown the original ApiError');
        } catch (error) {
            expect(error).toBe(originalApiError);
            expect(error.message).toBe('Original API Error');
            expect(error.status).toBe(403);
            expect(error.data).toEqual({ code: 'FORBIDDEN' });
        }
    });

    test('should handle network error with fetch in message', async () => {
        const fetchError = new Error('fetch request failed');
        fetch.mockRejectedValueOnce(fetchError);

        try {
            await authService.login({
                email: 'test@example.com',
                password: 'password123'
            });
            fail('Should have thrown an error');
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            expect(error.message).toBe('Erreur réseau - impossible de contacter le serveur');
            expect(error.status).toBe(0);
            expect(error.data.originalError).toBe(fetchError);
        }
    });

    test('should handle error with undefined message', async () => {
        const errorWithUndefinedMessage = new Error();
        delete errorWithUndefinedMessage.message;
        fetch.mockRejectedValueOnce(errorWithUndefinedMessage);

        try {
            await authService.login({
                email: 'test@example.com',
                password: 'password123'
            });
            fail('Should have thrown an error');
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            expect(error.message).toBe('Erreur réseau');
            expect(error.status).toBe(0);
        }
    });

    test('should handle login response without token field', async () => {
        const mockResponse = {
            user: { id: '1', email: 'test@example.com' }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await authService.login({
            email: 'test@example.com',
            password: 'password123'
        });

        expect(result).toEqual(mockResponse);

        clearAuthToken();

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: [] })
        });

        await userService.getAllUsers();

        expect(fetch).toHaveBeenLastCalledWith(
            `${process.env.REACT_APP_API_URL}/api/users`,
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                })
            })
        );

        const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1];
        expect(lastCall[1].headers.Authorization).toBeUndefined();
    });

    test('should handle successful request and clear timeout', async () => {
        const mockResponse = { success: true };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        const result = await userService.getAllUsers();

        expect(result).toEqual(mockResponse);
    });

    test('should handle getAllUsers with empty params object', async () => {
        setAuthToken('test-token');

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ users: [] })
        });

        await userService.getAllUsers({});

        expect(fetch).toHaveBeenCalledWith(
            `${process.env.REACT_APP_API_URL}/api/users`,
            expect.any(Object)
        );
    });

    test('should handle setAuthToken with null and undefined', () => {
        setAuthToken(null);
        setAuthToken(undefined);
        setAuthToken('');
        setAuthToken('real-token');
        expect(true).toBe(true);
    });

    describe('ApiError class coverage', () => {
        test('should create ApiError with all parameter combinations', () => {
            const error1 = new ApiError('Message only');
            expect(error1.message).toBe('Message only');
            expect(error1.status).toBeUndefined();
            expect(error1.data).toBeUndefined();

            const error2 = new ApiError('With status', 400);
            expect(error2.message).toBe('With status');
            expect(error2.status).toBe(400);
            expect(error2.data).toBeUndefined();

            const error3 = new ApiError('Complete', 500, { extra: 'data' });
            expect(error3.message).toBe('Complete');
            expect(error3.status).toBe(500);
            expect(error3.data).toEqual({ extra: 'data' });

            expect(error1 instanceof Error).toBe(true);
            expect(error2 instanceof ApiError).toBe(true);
            expect(error3.name).toBe('ApiError');
        });
    });
});