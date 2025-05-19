'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDocument } from '../lib/firebase/services';
import { User } from '../types';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Firebase token'ını al
          const token = await firebaseUser.getIdToken();
          
          // Token'ı cookie'ye kaydet
          Cookies.set('session', token, { expires: 7 }); // 7 gün geçerli

          // Firestore'dan kullanıcı bilgilerini al
          const userDoc = await getDocument<User>('users', firebaseUser.uid);
          if (!userDoc) {
            throw new Error('Kullanıcı bilgileri bulunamadı');
          }
          
          console.log('Kullanıcı bilgileri yüklendi:', userDoc);
          setUser(userDoc);
        } else {
          // Kullanıcı çıkış yaptığında cookie'yi sil
          Cookies.remove('session');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state değişikliği hatası:', error);
        // Hata durumunda cookie'yi sil ve kullanıcıyı çıkış yapmış say
        Cookies.remove('session');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 