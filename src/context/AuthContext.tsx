import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserData {
  role?: 'admin' | 'user';
  name?: string;
  photoUrl?: string;
  phone?: string;
  bio?: string;
}

interface AuthState {
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
}

type AuthContextType = AuthState;

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, isLoading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userData: null,
    isLoading: true,
  });

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        unsubscribeDoc = onSnapshot(
          doc(db, 'users', currentUser.uid),
          (userDoc) => {
            let finalUserData: UserData = { role: 'user' };
            if (userDoc.exists()) {
              finalUserData = userDoc.data() as UserData;
            }
            setAuthState({
              user: currentUser,
              userData: finalUserData,
              isLoading: false,
            });
          },
          (error) => {
            console.error("Error fetching user data:", error);
            setAuthState({
              user: currentUser,
              userData: { role: 'user' },
              isLoading: false,
            });
          }
        );
      } else {
        if (unsubscribeDoc) unsubscribeDoc();
        setAuthState({
          user: null,
          userData: null,
          isLoading: false,
        });
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
