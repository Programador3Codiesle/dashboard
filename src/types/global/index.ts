export interface IUser {
  id: string;
  name: string;
  role: 'admin' | 'employee';
}

export interface IErrorResponse {
  message: string;
  code: number;
}
