export interface IUser {
  id: string;
  name: string;
  user: string;
  role: 'admin' | 'employee';
}




export interface IErrorResponse {
  message: string;
  code: number;
}
