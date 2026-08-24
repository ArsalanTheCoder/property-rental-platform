import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import * as authApi from "@/api/auth";
import { ApiRequestError } from "@/api/config";

interface AuthContextValue {
  user: User | null;
  isCheckingSession: boolean;
  isSubmitting: boolean;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // True only while we are restoring the session on app launch.
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  // True while any auth action (login, register, etc.) is in flight.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On launch, the accessToken cookie (if any) tells us whether the
  // user is already signed in. This replaces any manual token check.
  useEffect(() => {
    authApi
      .getCurrentUser()
      .then(setUser)
      .finally(() => setIsCheckingSession(false));
  }, []);

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    setIsSubmitting(true);
    try {
      // Registration intentionally does not sign the user in - the
      // backend requires a verified email before login is allowed.
      await authApi.register(name, email, password, confirmPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyEmail = async (token: string) => {
    setIsSubmitting(true);
    try {
      await authApi.verifyEmail(token);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerification = async (email: string) => {
    setIsSubmitting(true);
    try {
      await authApi.resendVerification(email);
    } finally {
      setIsSubmitting(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsSubmitting(true);
    try {
      const loggedInUser = await authApi.login(email, password);
      setUser(loggedInUser);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    setIsSubmitting(true);
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setIsSubmitting(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(email);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, newPassword, confirmPassword);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isCheckingSession,
        isSubmitting,
        register,
        verifyEmail,
        resendVerification,
        login,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}

// Small helper so screens can tell a "wrong password" error apart
// from a "not verified yet" error without repeating status-code
// checks everywhere.
export function isEmailNotVerifiedError(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 403;
}
