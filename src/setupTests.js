import '@testing-library/jest-dom';

// ✅ Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// ✅ Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
};

// ✅ Global matchMedia mock
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

// ✅ Mock environment variables
process.env.REACT_APP_API_BASE_URL = 'http://localhost:3002';

// ✅ Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// ✅ Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve(''),
    headers: new Map(),
    status: 200,
    statusText: 'OK'
  })
);

// ✅ Suppress console logs and errors in tests
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
      args[0]?.includes?.('Router') ||
      args[0]?.includes?.('Warning: React.createElement') ||
      args[0]?.includes?.('useAuth must be used within an AuthProvider') ||
      args[0]?.includes?.('Element type is invalid') ||
      args[0]?.includes?.('Check your code at VendorProductListPage.jsx') ||
      args[0]?.includes?.('v7_startTransition') ||
      args[0]?.includes?.('v7_relativeSplatPath')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
  jest.clearAllMocks();
  
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});