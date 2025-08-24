import { supabase } from '../lib/supabase';
import { User } from '../types';
import { 
  sendVerificationEmail, 
  verifyCode, 
  generateVerificationCode 
} from '../utils/emailService';

// Store email verification sessions
const emailSessions = new Map<string, {
  email: string;
  nickname?: string;
  isSignup: boolean;
  verifiedAt?: number;
}>();

// Default user data
const defaultUser: Partial<User> = {
  nickname: 'Nomad User',
  avatar_url: 'https://via.placeholder.com/80x80/2196f3/ffffff?text=N',
  bio: 'Digital nomad exploring the world!',
  current_city: 'Unknown City',
  languages: ['English'],
  interests: [],
  skills: [],
  is_visible: true,
  is_available_for_meetup: true,
  location: { latitude: 0, longitude: 0 },
};

export class EmailAuthService {
  // Send verification code to email
  static async sendVerificationCode(email: string, nickname?: string, isSignup: boolean = false): Promise<boolean> {
    try {
      const code = generateVerificationCode();
      const success = await sendVerificationEmail(email, code);
      
      if (success) {
        // Store session data
        emailSessions.set(code, {
          email,
          nickname,
          isSignup,
        });
        
        // Clean up old sessions (older than 10 minutes)
        setTimeout(() => {
          emailSessions.delete(code);
        }, 10 * 60 * 1000);
      }
      
      return success;
    } catch (error) {
      console.error('Send verification code error:', error);
      return false;
    }
  }

  // Verify code and authenticate user
  static async verifyAndAuthenticate(code: string): Promise<{ user: User | null; error?: string }> {
    try {
      const session = emailSessions.get(code);
      if (!session) {
        return { user: null, error: '验证码无效或已过期' };
      }

      const { email, nickname, isSignup } = session;

      // Verify the code
      const isValid = verifyCode(email, code);
      if (!isValid) {
        return { user: null, error: '验证码无效或已过期' };
      }

      // Mark as verified
      session.verifiedAt = Date.now();

      if (isSignup) {
        // Create new user account
        return await this.createUserAccount(email, nickname);
      } else {
        // Sign in existing user
        return await this.signInUser(email);
      }
    } catch (error) {
      console.error('Verify and authenticate error:', error);
      return { user: null, error: '认证失败，请重试' };
    }
  }

  // Create new user account
  private static async createUserAccount(email: string, nickname?: string): Promise<{ user: User | null; error?: string }> {
    try {
      // Generate a secure random password
      const password = `email_auth_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname || email.split('@')[0],
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          // User already exists, try to sign in
          return await this.signInUser(email);
        }
        throw error;
      }

      if (data.user) {
        // Create user profile in database
        const userProfile: Partial<User> = {
          id: data.user.id,
          email,
          nickname: nickname || email.split('@')[0],
          ...defaultUser,
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert(userProfile);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        return { user: userProfile as User };
      }

      return { user: null, error: '账户创建失败' };
    } catch (error: any) {
      console.error('Create user account error:', error);
      return { user: null, error: error.message || '账户创建失败' };
    }
  }

  // Sign in existing user
  private static async signInUser(email: string): Promise<{ user: User | null; error?: string }> {
    try {
      // First, try to find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        console.error('User lookup error:', userError);
      }

      if (userData) {
        // User exists, return user data
        return { user: userData };
      } else {
        // User doesn't exist, this shouldn't happen for login
        return { user: null, error: '账户不存在，请先注册' };
      }
    } catch (error: any) {
      console.error('Sign in user error:', error);
      return { user: null, error: error.message || '登录失败' };
    }
  }

  // Check if user exists
  static async checkUserExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Check user exists error:', error);
      }

      return !!data;
    } catch (error) {
      console.error('Check user exists error:', error);
      return false;
    }
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): void {
    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    
    for (const [code, session] of emailSessions.entries()) {
      if (session.verifiedAt && session.verifiedAt < tenMinutesAgo) {
        emailSessions.delete(code);
      }
    }
  }
}

// Clean up expired sessions every 5 minutes
setInterval(() => {
  EmailAuthService.cleanupExpiredSessions();
}, 5 * 60 * 1000);
