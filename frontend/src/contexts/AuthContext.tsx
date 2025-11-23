import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { login, register, getUser } from "../api/authService";

// Kiểu dữ liệu Context
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => void;
}

// Tạo Context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load user khi app start
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const user = await getUser();
          setUser(user.user);
        } catch (err) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    loadUser();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "token") {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [token]);

  // Login
  const signIn = async (credentials: { email: string; password: string }) => {
    const response = await login(credentials);
    localStorage.setItem("token", response.token);
    setUser(response.user);
    setToken(response.token);
  };

  // Register
  const signUp = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await register(data);
    localStorage.setItem("token", response.token);
    setUser(response.user);
    setToken(response.token);
  };

  // Logout
  const signOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
