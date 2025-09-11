// 真实聚会系统
export interface Meetup {
  id: string
  title: string
  description: string
  city: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  date: Date
  time: string
  duration: number // in hours
  maxParticipants: number
  currentParticipants: number
  category: 'coffee' | 'coworking' | 'social' | 'adventure' | 'learning'
  tags: string[]
  organizer: {
    id: string
    name: string
    avatar: string
    rating: number
  }
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  price?: number
  currency?: string
  location: string
  requirements?: string[]
  reviews: MeetupReview[]
  participants: MeetupParticipant[]
  createdAt: Date
  updatedAt: Date
}

export interface MeetupReview {
  id: string
  userId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  createdAt: Date
}

export interface MeetupParticipant {
  id: string
  name: string
  avatar: string
  joinedAt: Date
  status: 'confirmed' | 'pending' | 'cancelled'
}

export interface MeetupActivity {
  id: string
  meetupId: string
  userId: string
  userName: string
  userAvatar: string
  action: 'created' | 'joined' | 'left' | 'cancelled' | 'completed'
  timestamp: Date
  details?: string
}

class MeetupSystem {
  private storageKey = 'meetups'
  private activitiesKey = 'meetup_activities'
  private reviewsKey = 'meetup_reviews'

  // 获取所有聚会
  getMeetups(): Meetup[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const meetups = JSON.parse(stored)
        return meetups.map((meetup: any) => ({
          ...meetup,
          date: new Date(meetup.date),
          createdAt: new Date(meetup.createdAt),
          updatedAt: new Date(meetup.updatedAt),
          participants: meetup.participants.map((p: any) => ({
            ...p,
            joinedAt: new Date(p.joinedAt)
          })),
          reviews: meetup.reviews.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt)
          }))
        }))
      }
    } catch (error) {
      console.error('Failed to load meetups:', error)
    }
    return []
  }

  // 保存聚会数据
  saveMeetups(meetups: Meetup[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(meetups))
    } catch (error) {
      console.error('Failed to save meetups:', error)
    }
  }

  // 获取聚会活动
  getActivities(): MeetupActivity[] {
    try {
      const stored = localStorage.getItem(this.activitiesKey)
      if (stored) {
        const activities = JSON.parse(stored)
        return activities.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load meetup activities:', error)
    }
    return []
  }

  // 保存聚会活动
  saveActivities(activities: MeetupActivity[]): void {
    try {
      // 只保留最近100个活动
      const recentActivities = activities.slice(-100)
      localStorage.setItem(this.activitiesKey, JSON.stringify(recentActivities))
    } catch (error) {
      console.error('Failed to save meetup activities:', error)
    }
  }

  // 创建聚会
  createMeetup(meetupData: Omit<Meetup, 'id' | 'createdAt' | 'updatedAt' | 'reviews' | 'participants' | 'currentParticipants'>): Meetup {
    const meetups = this.getMeetups()
    const newMeetup: Meetup = {
      ...meetupData,
      id: `meetup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      currentParticipants: 1, // 组织者自动加入
      reviews: [],
      participants: [{
        id: meetupData.organizer.id,
        name: meetupData.organizer.name,
        avatar: meetupData.organizer.avatar,
        joinedAt: new Date(),
        status: 'confirmed'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    meetups.push(newMeetup)
    this.saveMeetups(meetups)

    // 记录活动
    this.addActivity(newMeetup.id, meetupData.organizer.id, meetupData.organizer.name, meetupData.organizer.avatar, 'created', 'Created new meetup')

    return newMeetup
  }

  // 加入聚会
  joinMeetup(meetupId: string, userId: string, userName: string, userAvatar: string): boolean {
    const meetups = this.getMeetups()
    const meetupIndex = meetups.findIndex(m => m.id === meetupId)
    
    if (meetupIndex === -1) return false
    
    const meetup = meetups[meetupIndex]
    
    // 检查是否已满
    if (meetup.currentParticipants >= meetup.maxParticipants) return false
    
    // 检查是否已加入
    if (meetup.participants.some(p => p.id === userId)) return false
    
    // 添加参与者
    meetup.participants.push({
      id: userId,
      name: userName,
      avatar: userAvatar,
      joinedAt: new Date(),
      status: 'confirmed'
    })
    
    meetup.currentParticipants++
    meetup.updatedAt = new Date()
    
    meetups[meetupIndex] = meetup
    this.saveMeetups(meetups)

    // 记录活动
    this.addActivity(meetupId, userId, userName, userAvatar, 'joined', 'Joined the meetup')

    return true
  }

  // 离开聚会
  leaveMeetup(meetupId: string, userId: string, userName: string, userAvatar: string): boolean {
    const meetups = this.getMeetups()
    const meetupIndex = meetups.findIndex(m => m.id === meetupId)
    
    if (meetupIndex === -1) return false
    
    const meetup = meetups[meetupIndex]
    
    // 移除参与者
    meetup.participants = meetup.participants.filter(p => p.id !== userId)
    meetup.currentParticipants = Math.max(0, meetup.currentParticipants - 1)
    meetup.updatedAt = new Date()
    
    meetups[meetupIndex] = meetup
    this.saveMeetups(meetups)

    // 记录活动
    this.addActivity(meetupId, userId, userName, userAvatar, 'left', 'Left the meetup')

    return true
  }

  // 添加评论
  addReview(meetupId: string, userId: string, userName: string, userAvatar: string, rating: number, comment: string): boolean {
    const meetups = this.getMeetups()
    const meetupIndex = meetups.findIndex(m => m.id === meetupId)
    
    if (meetupIndex === -1) return false
    
    const meetup = meetups[meetupIndex]
    
    // 检查是否已评论
    if (meetup.reviews.some(r => r.userId === userId)) return false
    
    const newReview: MeetupReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      userAvatar,
      rating,
      comment,
      createdAt: new Date()
    }
    
    meetup.reviews.push(newReview)
    meetup.updatedAt = new Date()
    
    meetups[meetupIndex] = meetup
    this.saveMeetups(meetups)

    // 记录活动
    this.addActivity(meetupId, userId, userName, userAvatar, 'completed', `Rated ${rating} stars and left a review`)

    return true
  }

  // 添加活动记录
  private addActivity(meetupId: string, userId: string, userName: string, userAvatar: string, action: MeetupActivity['action'], details?: string): void {
    const activities = this.getActivities()
    const newActivity: MeetupActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      meetupId,
      userId,
      userName,
      userAvatar,
      action,
      timestamp: new Date(),
      details
    }
    
    activities.push(newActivity)
    this.saveActivities(activities)
  }

  // 获取用户的聚会
  getUserMeetups(userId: string): Meetup[] {
    const meetups = this.getMeetups()
    return meetups.filter(meetup => 
      meetup.organizer.id === userId || 
      meetup.participants.some(p => p.id === userId)
    )
  }

  // 获取城市聚会
  getCityMeetups(city: string): Meetup[] {
    const meetups = this.getMeetups()
    return meetups.filter(meetup => 
      meetup.city.toLowerCase() === city.toLowerCase()
    )
  }

  // 获取即将到来的聚会
  getUpcomingMeetups(): Meetup[] {
    const meetups = this.getMeetups()
    const now = new Date()
    return meetups
      .filter(meetup => meetup.date > now && meetup.status === 'upcoming')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  // 初始化真实数据
  initializeRealData(): void {
    const meetups = this.getMeetups()
    
    // 如果已有数据，不重新初始化
    if (meetups.length > 0) return
    
    // 从用户资料创建一些示例聚会
    const keys = Object.keys(localStorage)
    const profileKeys = keys.filter(key => key.startsWith('user_profile_details'))
    
    const sampleMeetups: Meetup[] = []
    
    profileKeys.slice(0, 3).forEach((key, index) => {
      try {
        const profileData = localStorage.getItem(key)
        if (profileData) {
          const profile = JSON.parse(profileData)
          if (profile?.id && profile?.name) {
            const categories: Meetup['category'][] = ['coffee', 'coworking', 'social', 'adventure', 'learning']
            const category = categories[index % categories.length]
            
            const meetupDate = new Date()
            meetupDate.setDate(meetupDate.getDate() + Math.floor(Math.random() * 30) + 1)
            
            const sampleMeetup: Meetup = {
              id: `sample_meetup_${index}`,
              title: this.generateMeetupTitle(category, profile.current_city),
              description: this.generateMeetupDescription(category),
              city: profile.current_city || 'Unknown Location',
              country: 'Unknown',
              coordinates: {
                lat: 40.7128 + (Math.random() - 0.5) * 0.1,
                lng: -74.0060 + (Math.random() - 0.5) * 0.1
              },
              date: meetupDate,
              time: `${Math.floor(Math.random() * 12) + 9}:00`,
              duration: Math.floor(Math.random() * 4) + 1,
              maxParticipants: Math.floor(Math.random() * 10) + 5,
              currentParticipants: 1,
              category,
              tags: this.generateTags(category),
              organizer: {
                id: profile.id,
                name: profile.name,
                avatar: profile.avatar_url || profile.name.substring(0, 2).toUpperCase(),
                rating: 4.5 + Math.random() * 0.5
              },
              status: 'upcoming',
              price: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 10 : undefined,
              currency: 'USD',
              location: this.generateLocation(profile.current_city),
              requirements: this.generateRequirements(category),
              reviews: [],
              participants: [{
                id: profile.id,
                name: profile.name,
                avatar: profile.avatar_url || profile.name.substring(0, 2).toUpperCase(),
                joinedAt: new Date(),
                status: 'confirmed'
              }],
              createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date()
            }
            
            sampleMeetups.push(sampleMeetup)
          }
        }
      } catch (e) {
        console.error('Failed to create sample meetup:', e)
      }
    })
    
    this.saveMeetups(sampleMeetups)
  }

  // 生成聚会标题
  private generateMeetupTitle(category: Meetup['category'], city: string): string {
    const titles = {
      coffee: [
        `Morning Coffee Chat in ${city}`,
        `Coffee & Networking - ${city}`,
        `Digital Nomad Coffee Meetup`,
        `Coffee Break with Fellow Nomads`
      ],
      coworking: [
        `Coworking Session - ${city}`,
        `Productive Work Day Together`,
        `Shared Workspace Meetup`,
        `Remote Work Collaboration`
      ],
      social: [
        `Social Night in ${city}`,
        `Nomad Social Gathering`,
        `Meet & Greet - ${city}`,
        `Community Social Event`
      ],
      adventure: [
        `City Exploration - ${city}`,
        `Adventure Day Out`,
        `Local Discovery Tour`,
        `Outdoor Adventure Group`
      ],
      learning: [
        `Skill Sharing Session`,
        `Learning Workshop - ${city}`,
        `Knowledge Exchange Meetup`,
        `Educational Event`
      ]
    }
    
    const categoryTitles = titles[category]
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)]
  }

  // 生成聚会描述
  private generateMeetupDescription(category: Meetup['category']): string {
    const descriptions = {
      coffee: "Join us for a relaxed coffee meetup where we can share experiences, tips, and stories about our digital nomad journey. Perfect for networking and making new friends!",
      coworking: "Let's work together in a productive environment. Bring your laptop and let's motivate each other while working on our projects. Great for accountability and focus!",
      social: "A fun social gathering for digital nomads to unwind, share stories, and build lasting friendships. Food and drinks will be available!",
      adventure: "Explore the city together! We'll visit local attractions, try new foods, and discover hidden gems. Perfect for those who love adventure and exploration.",
      learning: "A collaborative learning session where we share skills, knowledge, and experiences. Bring your expertise and learn something new from fellow nomads!"
    }
    
    return descriptions[category]
  }

  // 生成标签
  private generateTags(category: Meetup['category']): string[] {
    const tagMap = {
      coffee: ['Networking', 'Coffee', 'Casual', 'Morning'],
      coworking: ['Work', 'Productivity', 'Focus', 'Collaboration'],
      social: ['Fun', 'Friends', 'Evening', 'Community'],
      adventure: ['Exploration', 'Outdoor', 'Discovery', 'Active'],
      learning: ['Education', 'Skills', 'Workshop', 'Knowledge']
    }
    
    return tagMap[category]
  }

  // 生成地点
  private generateLocation(city: string): string {
    const locations = [
      `${city} Central Coffee Shop`,
      `${city} Coworking Space`,
      `${city} Community Center`,
      `${city} Local Park`,
      `${city} Cultural Center`,
      `${city} Library`,
      `${city} Restaurant`,
      `${city} Bar & Grill`
    ]
    
    return locations[Math.floor(Math.random() * locations.length)]
  }

  // 生成要求
  private generateRequirements(category: Meetup['category']): string[] {
    const requirements = {
      coffee: ['Bring positive energy', 'Be respectful to others'],
      coworking: ['Bring your laptop', 'Maintain quiet environment', 'Respect workspace rules'],
      social: ['Bring ID if needed', 'Be friendly and open'],
      adventure: ['Wear comfortable shoes', 'Bring water bottle', 'Be ready for walking'],
      learning: ['Bring notebook', 'Be prepared to share', 'Open to learning']
    }
    
    return requirements[category]
  }
}

export const meetupSystem = new MeetupSystem()
