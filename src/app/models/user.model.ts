import { UserResult } from './api-result.model';

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  nat: string;
  natCount: number;
  imageSrc: string;
  fullData: UserResult;
}

export interface UserGroup {
  title: string;
  users: User[];
}
