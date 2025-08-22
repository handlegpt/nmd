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
  created_at: string;
  updated_at: string;
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