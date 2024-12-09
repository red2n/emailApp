import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

/**
 * The AuthService class provides methods for handling authentication-related tasks,
 * such as hashing passwords, comparing passwords, generating JSON Web Tokens (JWTs),
 * and verifying JWTs.
 */
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  /**
   * Hashes a given password using bcrypt.
   *
   * @param password - The plain text password to be hashed.
   * @returns A promise that resolves to the hashed password.
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compares a plain text password with a hashed password to determine if they match.
   *
   * @param password - The plain text password to compare.
   * @param hashedPassword - The hashed password to compare against.
   * @returns A promise that resolves to a boolean indicating whether the passwords match.
   */
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generates a JSON Web Token (JWT) for the given user ID.
   *
   * @param userId - The unique identifier of the user for whom the token is being generated.
   * @returns A signed JWT as a string, which expires in 24 hours.
   */
  generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Verifies the provided JWT token.
   *
   * @param token - The JWT token to verify.
   * @returns A promise that resolves with the decoded token payload if the token is valid.
   * @throws An error if the token is invalid.
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}