import '@testing-library/jest-dom';

// ✅ Mock IntersectionObserver - FIX: Remove useless constructor
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// ✅ Mock ResizeObserver - FIX: Remove useless constructor
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

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

// Mock environment variables
process.env.REACT_APP_API_BASE_URL = 'http://localhost:3002';

// Suppress console.log in tests unless NODE_ENV is development
const originalLog = console.log;
const originalError = console.error;

beforeEach(() => {
  console.log = (...args) => {
    if (process.env.NODE_ENV === 'development') {
      originalLog(...args);
    }
  };
  
  
  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes?.('Warning: An invalid form control') ||
      args[0]?.includes?.('useLocation') ||
      args[0]?.includes?.('Router')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
});