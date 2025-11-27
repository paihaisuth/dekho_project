"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  [key: string]: unknown; // Adjust this to match the expected payload structure
}

interface User {
  userID: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  roleID: string;
  roleName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(accessToken);
          const {
            firstname,
            lastname,
            username,
            email,
            roleID,
            roleName,
            userID,
          } = decoded as {
            userID: string;
            firstname: string;
            lastname: string;
            username: string;
            email: string;
            roleID: string;
            roleName: string;
          };
          setTimeout(
            () =>
              setUser({
                userID,
                firstname,
                lastname,
                username,
                email,
                roleID,
                roleName,
              }),
            0
          ); // Defer state update to avoid cascading renders
        } catch (error) {
          console.error("Failed to decode token", error);
        }
      }

      setTimeout(() => {
        setIsAuthenticated(!!(accessToken && refreshToken));
        setLoading(false); // Mark initialization as complete
      }, 0);
    }
  }, []);

  const checkAuth = useCallback(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return !!(accessToken && refreshToken);
  }, []);

  useEffect(() => {
    const isAuth = checkAuth();
    if (isAuth !== isAuthenticated) {
      setTimeout(() => setIsAuthenticated(isAuth), 0); // Defer state update
    }
  }, [checkAuth, isAuthenticated]);

  useEffect(() => {
    if (!loading) {
      const publicPaths = ["/", "/login", "/register"];
      const path = window.location.pathname;

      const localeMatch = path.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : "en";

      const localizedPublicPaths = publicPaths.map((p) => `/${locale}${p}`);

      if (!isAuthenticated && !localizedPublicPaths.includes(path)) {
        router.push(`/${locale}`);
      }
    }
  }, [isAuthenticated, loading, router]);

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const { firstname, lastname, username, email, roleID, roleName, userID } =
        decoded as {
          userID: string;
          firstname: string;
          lastname: string;
          username: string;
          email: string;
          roleID: string;
          roleName: string;
        };
      setUser({
        firstname,
        lastname,
        username,
        email,
        roleID,
        roleName,
        userID,
      });
    } catch (error) {
      console.error("Failed to decode token", error);
    }

    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/"); // Redirect to public path
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
