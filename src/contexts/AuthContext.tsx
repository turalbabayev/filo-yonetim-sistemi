'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { UserService } from '@/lib/firebase/services';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.uid);
      if (firebaseUser) {
        try {
          // Firebase kullanıcısından bizim User tipimize dönüştür
          const userData = await UserService.get(firebaseUser.uid);
          console.log('User data fetched:', userData);
          setUser(userData);
          
          // Token'ı cookie'ye kaydet
          const token = await firebaseUser.getIdToken();
          Cookies.set('auth-token', token, { expires: 7 }); // 7 gün geçerli
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        console.log('No user found, clearing state');
        setUser(null);
        Cookies.remove('auth-token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Login attempt started');
    try {
      console.log('Attempting Firebase sign in');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase sign in successful:', userCredential.user.uid);

      console.log('Fetching user data');
      const userData = await UserService.get(userCredential.user.uid);
      console.log('User data fetched:', userData);
      
      setUser(userData);
      console.log('User state updated');

      // Yönlendirme işlemini değiştiriyoruz
      console.log('Attempting navigation to dashboard');
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    console.log('Sign out started');
    try {
      await firebaseSignOut(auth);
      setUser(null);
      console.log('Sign out successful, redirecting to login');
      window.location.href = '/auth/login';
    } catch (error: any) {
      console.error('Signout error:', error);
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
} 