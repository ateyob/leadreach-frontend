import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

interface User {
  username: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  checked: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  const login = useCallback((token: string, user: User) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("leadreach_auth", JSON.stringify({ token, user }));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("leadreach_auth");
  }, []);

  // Axios interceptor for auto-logout on 401/403
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn("Session expired. Logging out.");
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Restore session on mount
  useEffect(() => {
    const storedData = localStorage.getItem("leadreach_auth");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData?.token && parsedData?.user) {
          setToken(parsedData.token);
          setUser(parsedData.user);
        }
      } catch (error) {
        console.error("Failed to parse stored auth data:", error);
        localStorage.removeItem("leadreach_auth");
      }
    }

    setChecked(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        checked,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
