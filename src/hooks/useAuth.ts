import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false
  });

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          isAdmin: false
        });
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            isAdmin: false
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Si no existe el perfil, intentar crearlo
        if (error.code === 'PGRST116') {
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert([{
                user_id: user.id,
                email: user.email,
                role: 'user'
              }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating user profile:', createError);
              setAuthState({
                user,
                profile: null,
                loading: false,
                isAdmin: false
              });
              return;
            }

            setAuthState({
              user,
              profile: newProfile,
              loading: false,
              isAdmin: newProfile?.role === 'admin'
            });
            return;
          } catch (createErr) {
            console.error('Error in profile creation:', createErr);
          }
        }
        
        setAuthState({
          user,
          profile: null,
          loading: false,
          isAdmin: false
        });
        return;
      }

      setAuthState({
        user,
        profile,
        loading: false,
        isAdmin: profile?.role === 'admin'
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setAuthState({
        user,
        profile: null,
        loading: false,
        isAdmin: false
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refreshProfile: () => authState.user && loadUserProfile(authState.user)
  };
};