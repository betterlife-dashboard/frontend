export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  name: string;
  email?: string;
}
