import { supabase } from '../lib/supabase';

export interface Meetup {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  maxParticipants: number;
  currentParticipants: number;
  createdBy: {
    id: string;
    nickname: string;
    avatar: string;
  };
  participants: Array<{
    id: string;
    nickname: string;
    avatar: string;
  }>;
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  category?: string;
  isPrivate?: boolean;
  requirements?: string[];
  cost?: number;
  currency?: string;
}

export class ActivityService {
  // Cache for meetups data
  private static meetupsCache: Meetup[] | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get all meetups with caching
  static async getMeetups(): Promise<Meetup[]> {
    // Check cache first
    if (this.meetupsCache && Date.now() < this.cacheExpiry) {
      return this.meetupsCache;
    }

    try {
      // Try to get from database first
      const { data: dbMeetups, error } = await supabase
        .from('meetups')
        .select(`
          *,
          created_by:users!created_by_id(id, nickname, avatar_url),
          participants:meetup_participants(
            user:users(id, nickname, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meetups from database:', error);
        // Fallback to static data
        return this.getStaticMeetups();
      }

      if (dbMeetups && dbMeetups.length > 0) {
        // Transform database data to match our interface
        const transformedMeetups = dbMeetups.map(meetup => ({
          id: meetup.id,
          title: meetup.title,
          description: meetup.description,
          location: meetup.location,
          date: meetup.date,
          time: meetup.time,
          maxParticipants: meetup.max_participants,
          currentParticipants: meetup.current_participants,
          createdBy: {
            id: meetup.created_by?.id || 'unknown',
            nickname: meetup.created_by?.nickname || 'Unknown User',
            avatar: meetup.created_by?.avatar_url || '',
          },
          participants: meetup.participants?.map((p: any) => ({
            id: p.user?.id || 'unknown',
            nickname: p.user?.nickname || 'Unknown User',
            avatar: p.user?.avatar_url || '',
          })) || [],
          tags: meetup.tags || [],
          status: meetup.status as 'upcoming' | 'ongoing' | 'completed',
          createdAt: meetup.created_at,
          latitude: meetup.latitude,
          longitude: meetup.longitude,
          city: meetup.city,
          country: meetup.country,
          category: meetup.category,
          isPrivate: meetup.is_private,
          requirements: meetup.requirements || [],
          cost: meetup.cost,
          currency: meetup.currency,
        }));

        // Cache the data
        this.meetupsCache = transformedMeetups;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;

        return transformedMeetups;
      }

      // If no database data, use static data
      return this.getStaticMeetups();
    } catch (error) {
      console.error('Error in getMeetups:', error);
      return this.getStaticMeetups();
    }
  }

  // Get static meetups data (fallback)
  private static getStaticMeetups(): Meetup[] {
    return [
      {
        id: '1',
        title: 'Bali Digital Nomad Coffee Meetup',
        description: 'Let\'s grab coffee and share our digital nomad experiences! Perfect for networking and making new friends.',
        location: 'Canggu Coworking Space, Bali',
        date: 'Tomorrow',
        time: '10:00 AM',
        maxParticipants: 8,
        currentParticipants: 3,
        createdBy: {
          id: '1',
          nickname: 'Alex',
          avatar: '',
        },
        participants: [
          { id: '1', nickname: 'Alex', avatar: '' },
          { id: '2', nickname: 'Sarah', avatar: '' },
          { id: '3', nickname: 'Mike', avatar: '' },
        ],
        tags: ['Coffee', 'Networking', 'Coworking'],
        status: 'upcoming',
        createdAt: '2 hours ago',
        city: 'Bali',
        country: 'Indonesia',
        category: 'Networking',
        isPrivate: false,
        requirements: [],
        cost: 0,
        currency: 'USD',
      },
      {
        id: '2',
        title: 'Surfing Session at Uluwatu',
        description: 'Early morning surf session! All levels welcome. Let\'s catch some waves together.',
        location: 'Uluwatu Beach, Bali',
        date: 'Today',
        time: '6:00 AM',
        maxParticipants: 6,
        currentParticipants: 4,
        createdBy: {
          id: '2',
          nickname: 'Sarah',
          avatar: '',
        },
        participants: [
          { id: '2', nickname: 'Sarah', avatar: '' },
          { id: '4', nickname: 'Tom', avatar: '' },
          { id: '5', nickname: 'Emma', avatar: '' },
          { id: '6', nickname: 'David', avatar: '' },
        ],
        tags: ['Surfing', 'Beach', 'Morning'],
        status: 'upcoming',
        createdAt: '1 day ago',
        city: 'Bali',
        country: 'Indonesia',
        category: 'Sports',
        isPrivate: false,
        requirements: ['Surfboard', 'Basic swimming skills'],
        cost: 20,
        currency: 'USD',
      },
      {
        id: '3',
        title: 'Lunch at Seminyak Cafe',
        description: 'Casual lunch meetup! Great food and conversation guaranteed.',
        location: 'Seminyak Cafe, Bali',
        date: 'Today',
        time: '1:00 PM',
        maxParticipants: 4,
        currentParticipants: 2,
        createdBy: {
          id: '3',
          nickname: 'Mike',
          avatar: '',
        },
        participants: [
          { id: '3', nickname: 'Mike', avatar: '' },
          { id: '7', nickname: 'Lisa', avatar: '' },
        ],
        tags: ['Lunch', 'Food', 'Casual'],
        status: 'upcoming',
        createdAt: '3 hours ago',
        city: 'Bali',
        country: 'Indonesia',
        category: 'Food',
        isPrivate: false,
        requirements: [],
        cost: 15,
        currency: 'USD',
      },
    ];
  }

  // Create a new meetup
  static async createMeetup(meetupData: Partial<Meetup>): Promise<Meetup | null> {
    try {
      const { data, error } = await supabase
        .from('meetups')
        .insert({
          title: meetupData.title,
          description: meetupData.description,
          location: meetupData.location,
          date: meetupData.date,
          time: meetupData.time,
          max_participants: meetupData.maxParticipants,
          current_participants: 1, // Creator is first participant
          created_by_id: meetupData.createdBy?.id,
          tags: meetupData.tags,
          status: 'upcoming',
          city: meetupData.city,
          country: meetupData.country,
          category: meetupData.category,
          is_private: meetupData.isPrivate || false,
          requirements: meetupData.requirements,
          cost: meetupData.cost,
          currency: meetupData.currency,
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cache to refresh data
      this.clearCache();

      return data;
    } catch (error) {
      console.error('Error creating meetup:', error);
      return null;
    }
  }

  // Join a meetup
  static async joinMeetup(meetupId: string, userId: string): Promise<boolean> {
    try {
      // Add participant to meetup
      const { error } = await supabase
        .from('meetup_participants')
        .insert({
          meetup_id: meetupId,
          user_id: userId,
        });

      if (error) throw error;

      // Update current participants count
      const { error: updateError } = await supabase
        .from('meetups')
        .update({
          current_participants: supabase.rpc('increment', { row_id: meetupId, column_name: 'current_participants' })
        })
        .eq('id', meetupId);

      if (updateError) throw updateError;

      // Clear cache to refresh data
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error joining meetup:', error);
      return false;
    }
  }

  // Leave a meetup
  static async leaveMeetup(meetupId: string, userId: string): Promise<boolean> {
    try {
      // Remove participant from meetup
      const { error } = await supabase
        .from('meetup_participants')
        .delete()
        .eq('meetup_id', meetupId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update current participants count
      const { error: updateError } = await supabase
        .from('meetups')
        .update({
          current_participants: supabase.rpc('decrement', { row_id: meetupId, column_name: 'current_participants' })
        })
        .eq('id', meetupId);

      if (updateError) throw updateError;

      // Clear cache to refresh data
      this.clearCache();

      return true;
    } catch (error) {
      console.error('Error leaving meetup:', error);
      return false;
    }
  }

  // Get meetups by category
  static async getMeetupsByCategory(category: string): Promise<Meetup[]> {
    const meetups = await this.getMeetups();
    return meetups.filter(meetup => meetup.category === category);
  }

  // Get meetups by location
  static async getMeetupsByLocation(city: string): Promise<Meetup[]> {
    const meetups = await this.getMeetups();
    return meetups.filter(meetup => meetup.city === city);
  }

  // Search meetups
  static async searchMeetups(query: string): Promise<Meetup[]> {
    const meetups = await this.getMeetups();
    const lowerQuery = query.toLowerCase();
    
    return meetups.filter(meetup => 
      meetup.title.toLowerCase().includes(lowerQuery) ||
      meetup.description.toLowerCase().includes(lowerQuery) ||
      meetup.location.toLowerCase().includes(lowerQuery) ||
      meetup.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get user's meetups
  static async getUserMeetups(userId: string): Promise<Meetup[]> {
    const meetups = await this.getMeetups();
    return meetups.filter(meetup => 
      meetup.createdBy.id === userId ||
      meetup.participants.some(p => p.id === userId)
    );
  }

  // Clear cache
  static clearCache(): void {
    this.meetupsCache = null;
    this.cacheExpiry = 0;
  }
}
