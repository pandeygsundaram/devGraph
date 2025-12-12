import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ActivityData {
  userId: string;
  activityType: 'code' | 'chat' | 'command';
  content: string;
  metadata?: any;
}
