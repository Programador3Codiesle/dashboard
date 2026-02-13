import { createContext } from 'react';
import { IUser } from '@/types/global';

export type User = IUser;

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: { user: string; password: string }) => Promise<void>;
    logout: () => void;
    updateUser: (partial: Partial<User>) => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
