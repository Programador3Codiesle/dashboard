import { useState } from 'react';
import { IUser, IErrorResponse } from '@/types/global';

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<IUser | null>({ id: 'user-001', name: 'Junior Dev', role: 'admin' });
  const [loading, setLoading] = useState(false);

  const login = async (credentials: any) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ id: 'user-001', name: 'Junior Dev', role: 'admin' });
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return { user, isAuthenticated: !!user, loading, login, logout };
};
