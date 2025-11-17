/**
 * Generate a random ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format error response
 */
export const formatError = (
  message: string,
  details?: any
): { success: false; message: string; details?: any } => {
  return {
    success: false,
    message,
    ...(details && { details }),
  };
};

/**
 * Format success response
 */
export const formatSuccess = <T = any>(
  message: string,
  data?: T
): { success: true; message: string; data?: T } => {
  return {
    success: true,
    message,
    ...(data && { data }),
  };
};

/**
 * Sleep utility for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate strong password
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
