import { AuthService } from "./authService.js";
import type { IAuthResponse, IUser } from "./model/user.js";


/**
 * The UserService class provides methods for user registration and login.
 * It manages user data and interacts with the AuthService for password hashing and token generation.
 */
export class UserService {
  private users: Map<string, IUser> = new Map();
  private authService: AuthService;

  /**
   * Creates an instance of the UserService class.
   * Initializes the AuthService to handle authentication-related tasks.
   */
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Registers a new user with the provided email, phone number, and password.
   * 
   * @param email - The email address of the user to register.
   * @param phoneNumber - The phone number of the user to register.
   * @param password - The password for the user account.
   * @returns A promise that resolves to an IAuthResponse object indicating the success or failure of the registration.
   * 
   * @throws Will return an error message if the registration fails.
   */
  async register(email: string, phoneNumber: string, password: string): Promise<IAuthResponse> {
    try {
      // Check if user already exists
      if (this.users.has(email)) {
        return { success: false, error: 'User already exists' };
      }

      const hashedPassword = await this.authService.hashPassword(password);
      const user: IUser = {
        id: Date.now().toString(),
        email,
        phoneNumber,
        password: hashedPassword,
        isEmailVerified: false,
        isPhoneVerified: false
      };

      this.users.set(email, user);
      const token = this.authService.generateToken(user.id);

      return { success: true, token };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Logs in a user with the provided email and password.
   *
   * @param email - The email address of the user attempting to log in.
   * @param password - The password of the user attempting to log in.
   * @returns A promise that resolves to an IAuthResponse object containing the login result.
   *          If successful, the response includes a token. Otherwise, it includes an error message.
   *
   * @throws Will return an error message if the login process fails.
   */
  async login(email: string, password: string): Promise<IAuthResponse> {
    try {
      const user = this.users.get(email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const isValidPassword = await this.authService.comparePassword(password, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }

      const token = this.authService.generateToken(user.id);
      return { success: true, token };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }
}