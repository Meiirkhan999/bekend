import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from localStorage on mount and initialize admin account
  useEffect(() => {
    // Initialize admin account if it doesn't exist
    const existingUsers = JSON.parse(localStorage.getItem('labSupplyUsers') || '[]');
    const adminExists = existingUsers.some((u: any) => u.email === 'admin@gmail.com');
    
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-001',
        email: 'admin@gmail.com',
        name: 'Administrator',
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      const hashedPassword = btoa('12345678');
      existingUsers.push({ ...adminUser, password: hashedPassword });
      localStorage.setItem('labSupplyUsers', JSON.stringify(existingUsers));
    }

    const savedUser = localStorage.getItem('labSupplyUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const register = async (email: string, password: string, name: string) => {
    // Validate input
    if (!email.includes('@')) throw new Error('Invalid email format');
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    if (!name.trim()) throw new Error('Name is required');

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('labSupplyUsers') || '[]');
    if (existingUsers.some((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const hashedPassword = btoa(password); // Simple encoding (not secure for production)
    existingUsers.push({ ...newUser, password: hashedPassword });
    localStorage.setItem('labSupplyUsers', JSON.stringify(existingUsers));

    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('labSupplyUser', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string) => {
    const existingUsers = JSON.parse(localStorage.getItem('labSupplyUsers') || '[]');
    const foundUser = existingUsers.find((u: any) => u.email === email && u.password === btoa(password));

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('labSupplyUser', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('labSupplyUser');
  };

  const resetPassword = async (email: string) => {
    const existingUsers = JSON.parse(localStorage.getItem('labSupplyUsers') || '[]');
    const foundUser = existingUsers.find((u: any) => u.email === email);

    if (!foundUser) {
      throw new Error('User not found');
    }

    // In a real app, send email with reset link
    const newPassword = 'TempPassword123';
    foundUser.password = btoa(newPassword);
    const updatedUsers = existingUsers.map((u: any) => (u.id === foundUser.id ? foundUser : u));
    localStorage.setItem('labSupplyUsers', JSON.stringify(updatedUsers));

    alert(`Password reset. Temporary password: ${newPassword}`);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
