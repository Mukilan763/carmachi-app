// ========================================
// CarMachi — Forum Types
// ========================================

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  category: ForumCategory;
  carId?: string;           // Linked car model
  carName?: string;
  createdAt: string;        // ISO date
  updatedAt?: string;
  likes: number;
  replies: ForumReply[];
  tags: string[];
  isVerifiedOwner?: boolean;
  rating?: number;          // 1-5 for reviews
  city?: string;
}

export interface ForumReply {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  isVerifiedOwner?: boolean;
}

export type ForumCategory = 
  | 'review'
  | 'buying-advice'
  | 'ownership'
  | 'comparison'
  | 'general'
  | 'tips';

export interface ForumFilters {
  category?: ForumCategory;
  carId?: string;
  sortBy?: 'recent' | 'popular' | 'most-helpful';
  search?: string;
}
