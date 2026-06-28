export type AuthUser = {
  id?: string;
  email: string;
  name?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

