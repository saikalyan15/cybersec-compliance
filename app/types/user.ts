export type UserRole = 'admin' | 'user' | 'owner';

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  designation: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
