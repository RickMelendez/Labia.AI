/**
 * ValidationService
 * Domain service for input validation (business rules)
 */
export class ValidationService {
  private static readonly BIO_MAX_LENGTH = 500;
  private static readonly BIO_MIN_LENGTH = 1;
  private static readonly MESSAGE_MAX_LENGTH = 1000;
  private static readonly MESSAGE_MIN_LENGTH = 1;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Validates a bio input
   */
  static validateBio(bio: string): { isValid: boolean; error?: string } {
    if (!bio || bio.trim().length === 0) {
      return { isValid: false, error: 'Bio cannot be empty' };
    }

    if (bio.length < this.BIO_MIN_LENGTH) {
      return { isValid: false, error: `Bio must be at least ${this.BIO_MIN_LENGTH} character` };
    }

    if (bio.length > this.BIO_MAX_LENGTH) {
      return { isValid: false, error: `Bio must be less than ${this.BIO_MAX_LENGTH} characters` };
    }

    return { isValid: true };
  }

  /**
   * Validates a message input
   */
  static validateMessage(message: string): { isValid: boolean; error?: string } {
    if (!message || message.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (message.length < this.MESSAGE_MIN_LENGTH) {
      return { isValid: false, error: `Message must be at least ${this.MESSAGE_MIN_LENGTH} character` };
    }

    if (message.length > this.MESSAGE_MAX_LENGTH) {
      return { isValid: false, error: `Message must be less than ${this.MESSAGE_MAX_LENGTH} characters` };
    }

    return { isValid: true };
  }

  /**
   * Validates an email address
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'Email cannot be empty' };
    }

    if (!this.EMAIL_REGEX.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  /**
   * Validates a password
   */
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password || password.length === 0) {
      return { isValid: false, error: 'Password cannot be empty' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }

    return { isValid: true };
  }
}
