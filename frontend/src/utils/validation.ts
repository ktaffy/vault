export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validates an email address
 */
export const validateEmail = (email: string): ValidationResult => {
    if (!email || !email.trim()) {
        return { valid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
        return { valid: false, error: 'Please enter a valid email' };
    }

    return { valid: true };
};

/**
 * Validates a password
 * Requirements: minimum 8 characters
 */
export const validatePassword = (password: string): ValidationResult => {
    if (!password || !password.trim()) {
        return { valid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' };
    }

    return { valid: true };
};

/**
 * Validates a username
 * Requirements: minimum 3 characters, no spaces
 */
export const validateUsername = (username: string): ValidationResult => {
    if (!username || !username.trim()) {
        return { valid: false, error: 'Username is required' };
    }

    if (username.trim().length < 3) {
        return { valid: false, error: 'Username must be at least 3 characters' };
    }

    if (username.includes(' ')) {
        return { valid: false, error: 'Username cannot contain spaces' };
    }

    return { valid: true };
};

/**
 * Validates password confirmation matches
 */
export const validatePasswordMatch = (
    password: string,
    confirmPassword: string
): ValidationResult => {
    if (!confirmPassword || !confirmPassword.trim()) {
        return { valid: false, error: 'Please confirm your password' };
    }

    if (password !== confirmPassword) {
        return { valid: false, error: 'Passwords do not match' };
    }

    return { valid: true };
};

/**
 * Validates a required field
 */
export const validateRequired = (
    value: string,
    fieldName: string = 'This field'
): ValidationResult => {
    if (!value || !value.trim()) {
        return { valid: false, error: `${fieldName} is required` };
    }

    return { valid: true };
};

/**
 * Validates minimum length
 */
export const validateMinLength = (
    value: string,
    minLength: number,
    fieldName: string = 'This field'
): ValidationResult => {
    if (!value || value.length < minLength) {
        return {
            valid: false,
            error: `${fieldName} must be at least ${minLength} characters`
        };
    }

    return { valid: true };
};

/**
 * Validates maximum length
 */
export const validateMaxLength = (
    value: string,
    maxLength: number,
    fieldName: string = 'This field'
): ValidationResult => {
    if (value && value.length > maxLength) {
        return {
            valid: false,
            error: `${fieldName} must be no more than ${maxLength} characters`
        };
    }

    return { valid: true };
};

/**
 * Helper to validate multiple fields at once
 * Returns an object with field names as keys and error messages as values
 */
export const validateFields = (
    validations: Record<string, ValidationResult>
): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    Object.entries(validations).forEach(([field, result]) => {
        if (!result.valid && result.error) {
            errors[field] = result.error;
        }
    });

    return {
        valid: Object.keys(errors).length === 0,
        errors,
    };
};