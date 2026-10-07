// Simple client auth store for Google and Email sign-in state

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
  provider: 'google' | 'email';
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
    name: 'Guest Indian Driver',
    email: '',
    isLoggedIn: false,
    provider: 'email'
  };
};

export const loginUser = (user: { name: string; email: string; provider: 'google' | 'email'; avatar?: string }): UserProfile => {
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
