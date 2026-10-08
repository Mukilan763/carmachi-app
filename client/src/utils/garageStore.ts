// Utility for managing saved / bookmarked cars in the Garage via localStorage and MongoDB Sync

import { authAPI } from './api';
import { getUser } from './authStore';

export interface SavedCar {
  id: string;
  name: string;
  brand: string;
  priceMin: number;
  priceMax: number;
  imageUrl: string;
  bodyType: string;
  savedAt: string;
  notes?: string;
}

const STORAGE_KEY = 'carmachi_garage_saved_cars';

export const getGarageCars = (): SavedCar[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading garage cars:", e);
    return [];
  }
};

const syncWithCloud = async (list: SavedCar[]) => {
  const user = getUser();
  if (user.isLoggedIn && user.token) {
    try {
      const carIds = list.map(c => c.id);
      await authAPI.syncGarage(carIds, user.token);
    } catch (err) {
      console.error("Failed to sync garage to cloud", err);
    }
  }
};

export const saveToGarage = (car: Omit<SavedCar, 'savedAt'>): boolean => {
  try {
    const list = getGarageCars();
    if (list.some(c => c.id === car.id)) return false; // already saved
    list.unshift({ ...car, savedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('garage-updated'));
    
    // Sync to cloud in background
    syncWithCloud(list);
    
    return true;
  } catch (e) {
    console.error("Error saving to garage:", e);
    return false;
  }
};

export const removeFromGarage = (carId: string): void => {
  try {
    const list = getGarageCars().filter(c => c.id !== carId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('garage-updated'));
    
    // Sync to cloud in background
    syncWithCloud(list);
  } catch (e) {
    console.error("Error removing from garage:", e);
  }
};

export const setFullGarage = (list: SavedCar[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('garage-updated'));
};

export const isCarInGarage = (carId: string): boolean => {
  const list = getGarageCars();
  return list.some(c => c.id === carId);
};
