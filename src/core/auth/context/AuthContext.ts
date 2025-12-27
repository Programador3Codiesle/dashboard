import { createContext } from 'react';
import { IUser } from '@/types/global';

export type User = IUser;

export interface AuthContextType {
    user: User | null;
    login: (credentials: { user: string; password: string }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    getToken?: () => string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
