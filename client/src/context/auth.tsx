import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    localStorage.removeItem("user");
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadUserFromStorage());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async (retries = 1) => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            login(data.user);
          }
        } else if (response.status === 401 && retries > 0) {
          // Retry once after 500ms if 401 (could be session timing issue)
          await new Promise(resolve => setTimeout(resolve, 500));
          return checkAuth(retries - 1);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        setUser(loadUserFromStorage());
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
