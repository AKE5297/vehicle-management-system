import { createContext } from "react";

// 定义认证上下文类型
interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  currentUser: any | null;
  setCurrentUser: (user: any) => void;
  isAdmin: boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

// 创建认证上下文并提供默认值
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  isAdmin: false,
  logout: () => {},
  hasPermission: () => false,
});