import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isInternal: boolean;
  isVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (authUser: User) => {
    console.log('AuthContext: fetchProfile called for', authUser.id);
    try {
      console.log('AuthContext: starting Supabase query');
      const { data, error } = await supabase
        .from('users')
        .select('*, vendors(name)')
        .eq('auth_uid', authUser.id)
        .single();
      
      console.log('AuthContext: Supabase query finished', { data, error });

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        console.log('AuthContext: Profile data found, setting userProfile state');
        setUserProfile({
          id: data.id,
          auth_uid: data.auth_uid,
          email: data.email,
          display_name: data.display_name,
          role: data.role,
          vendor_id: data.vendor_id,
          is_active: data.is_active,
          vendor_name: (data as any).vendors?.name || undefined,
        });
      }
    } catch (err) {
      console.error('Profile fetch failed with exception:', err);
    }
  }, []);

  useEffect(() => {
    console.log("AuthContext: Starting initial session listener");
    
    // Listen for auth changes. INITIAL_SESSION is fired automatically on mount in v2
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("AuthContext: onAuthStateChange event", event);
        
        // Prevent concurrent fetches if event is not changing user
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          console.log("AuthContext: fetching profile from onAuthStateChange");
          // Do NOT await fetchProfile here to avoid deadlocking Supabase's auth token lock!
          fetchProfile(newSession.user).finally(() => {
            console.log("AuthContext: setting loading false after profile fetch");
            setLoading(false);
          });
        } else {
          setUserProfile(null);
          console.log("AuthContext: setting loading false from onAuthStateChange (no user)");
          setLoading(false);
        }
      }
    );

    // Fallback: If INITIAL_SESSION doesn't fire within 2 seconds, force loading to false
    const fallbackTimer = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          console.warn("AuthContext: INITIAL_SESSION event timed out. Forcing loading to false.");
          return false;
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserProfile(null);
  };

  const isInternal = userProfile
    ? ['superadmin', 'admin', 'manager'].includes(userProfile.role)
    : false;

  const isVendor = userProfile?.role === 'vendor_viewer';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userProfile,
        loading,
        signIn,
        signOut,
        isInternal,
        isVendor,
      }}
    >
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
