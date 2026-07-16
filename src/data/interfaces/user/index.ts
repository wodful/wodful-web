export interface IUserData {
  name: string;
  email: string;
  role?: string;
}

export interface AuthenticatedUser {
  token: string;
  user: IUserData;
}

export interface PublicUser {
  code: string;
  championship: {
    name: string;
  };
}

export interface IAuthenticateUserRequest {
  email: string;
  password: string;
}
