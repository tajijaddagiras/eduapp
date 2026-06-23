import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  role?: 'admin' | 'user';
  name?: string;
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch role data first without changing the user state yet
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          let finalUserData: UserData = { role: 'user' }; // default
          
          if (userDoc.exists()) {
            finalUserData = userDoc.data() as UserData;
          }
          
          // Update everything at once to prevent flickers
          setAuthState({
            user: currentUser,
            userData: finalUserData,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setAuthState({
            user: currentUser,
            userData: { role: 'user' },
            isLoading: false,
          });
        }
      } else {
        // Not logged in
        setAuthState({
          user: null,
          userData: null,
          isLoading: false,
        });
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
