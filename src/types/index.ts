export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
  bio?: string;
  current_city: string;
  languages: string[];
  interests: string[];
  is_visible: boolean;
  is_available_for_meetup: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  // 新增用户资料字段
  full_name?: string;
  phone?: string;
  website?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    portfolio?: string;
  };
  skills: string[];
  work_experience?: WorkExperience[];
  education?: Education[];
  travel_history?: TravelHistory[];
  preferences?: UserPreferences;
  stats?: UserStats;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  description?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  skills_used: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description?: string;
}

export interface TravelHistory {
  id: string;
  city: string;
  country: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  photos?: string[];
}

export interface UserPreferences {
  privacy_level: 'public' | 'friends' | 'private';
  notification_settings: {
    messages: boolean;
    meetups: boolean;
    likes: boolean;
    comments: boolean;
    new_followers: boolean;
    location_updates: boolean;
  };
  language_preference: string;
  timezone: string;
  currency: string;
  distance_unit: 'km' | 'miles';
}

export interface UserStats {
  posts_count: number;
  followers_count: number;
  following_count: number;
  meetups_attended: number;
  meetups_created: number;
  countries_visited: number;
  cities_visited: number;
  total_distance_traveled: number;
  member_since: string;
  last_active: string;
}

export interface FollowRelationship {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: User;
  following?: User;
}

export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls?: string[];
  location?: Location;
  meetup_details?: {
    title: string;
    date_time: string;
    location: Location;
    max_participants: number;
    current_participants: number;
  };
  likes: number;
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    nickname: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  from_user_id?: string;
  type: 'like' | 'comment' | 'message' | 'meetup_invite' | 'meetup_update';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  location: Location;
  date_time: string;
  max_participants: number;
  current_participants: number;
  created_by: string;
  participants: string[];
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface MapState {
  currentLocation: Location | null;
  nearbyUsers: User[];
  selectedUser: User | null;
  loading: boolean;
}

export interface AppState {
  auth: AuthState;
  map: MapState;
  theme: 'light' | 'dark';
} 