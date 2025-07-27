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

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
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