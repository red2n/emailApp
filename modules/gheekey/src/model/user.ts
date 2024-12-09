export type IUser = {
  id: string;
  email: string;
  phoneNumber: string;
  password: string; // Will be stored as hashed
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export type IAuthResponse = {
  success: boolean;
  token?: string;
  error?: string;
}

export type IEmailVerification = {
  success: boolean;
  error?: string;
}

export type IPhoneVerification = {
  success: boolean;
  error?: string;
}