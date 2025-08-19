// Setup global pour tous les tests
import '@testing-library/jest-dom';

// Supprimer TOUS les warnings indésirables
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
    console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (
            message.includes('React Router Future Flag Warning') ||
            message.includes('MUI Grid:') ||
            message.includes('No routes matched location') ||
            message.includes('validateDOMNesting')
        ) {
            return;
        }
        originalWarn.call(console, ...args);
    };

    console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (
            message.includes('Warning:') ||
            message.includes('validateDOMNesting')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
});

// Mock global de react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
    },
    ToastContainer: () => null,
}));

// Mock fetch global
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock process.env.API_URL
process.env.API_URL = 'https://ci-cd-back-dbsx.onrender.com';