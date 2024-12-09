import { AuthService } from "./authService.js";
import type { IAuthResponse, IUser } from "./model/user.js";


export class UserService {
  private users: Map<string, IUser> = new Map();
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

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