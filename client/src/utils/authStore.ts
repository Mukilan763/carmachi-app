// Simple client auth store for Google and Email sign-in state

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
  provider: 'google' | 'email';
  token?: string;
}

const AUTH_KEY = 'carmachi_user_auth';

export const getUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading user auth:", e);
  }
  return {
    name: 'Guest Driver',
    email: '',
    isLoggedIn: false,
    provider: 'email'
  };
};

export const loginUser = (user: { id?: string; name: string; email: string; provider: 'google' | 'email'; avatar?: string; token?: string }): UserProfile => {
  const profile: UserProfile = {
    ...user,
    isLoggedIn: true
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('auth-updated'));
  return profile;
};

export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event('auth-updated'));
};
