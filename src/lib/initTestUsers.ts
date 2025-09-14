// 初始化测试用户数据
export interface TestUser {
  id: string
  name: string
  email: string
  avatar?: string
  profession: string
  company?: string
  currentLocation: string
  interests: string[]
  bio: string
  onlineStatus: {
    isOnline: boolean
    isAvailable: boolean
    status: 'online' | 'offline' | 'away' | 'busy'
    lastSeen: string
  }
  memberSince: string
}

export function initializeTestUsers(): void {
  // 检查是否已经有nomad_users数据
  const existingUsers = null // REMOVED: localStorage usage for nomad_users
  if (existingUsers && JSON.parse(existingUsers).length > 0) {
    return
  }

  const testUsers: TestUser[] = [
    {
      id: 'test_user_1',
      name: 'Alex Chen',
      email: 'alex@example.com',
      avatar: 'AC',
      profession: 'Software Developer',
      company: 'Tech Corp',
      currentLocation: 'San Francisco',
      interests: ['Technology', 'Coffee', 'Hiking'],
      bio: 'Passionate developer exploring the world while coding remotely.',
      onlineStatus: {
        isOnline: true,
        isAvailable: true,
        status: 'online',
        lastSeen: new Date().toISOString()
      },
      memberSince: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'test_user_2',
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      avatar: 'MR',
      profession: 'Digital Marketer',
      company: 'Marketing Agency',
      currentLocation: 'Barcelona',
      interests: ['Marketing', 'Travel', 'Photography'],
      bio: 'Digital nomad marketer sharing stories from around the world.',
      onlineStatus: {
        isOnline: true,
        isAvailable: false,
        status: 'busy',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      memberSince: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'test_user_3',
      name: 'David Kim',
      email: 'david@example.com',
      avatar: 'DK',
      profession: 'UX Designer',
      company: 'Design Studio',
      currentLocation: 'Tokyo',
      interests: ['Design', 'Art', 'Food'],
      bio: 'UX designer with a passion for creating beautiful digital experiences.',
      onlineStatus: {
        isOnline: false,
        isAvailable: false,
        status: 'offline',
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      memberSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'test_user_4',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'SJ',
      profession: 'Content Writer',
      company: 'Freelance',
      currentLocation: 'Lisbon',
      interests: ['Writing', 'Travel', 'Culture'],
      bio: 'Freelance writer documenting the digital nomad lifestyle.',
      onlineStatus: {
        isOnline: true,
        isAvailable: true,
        status: 'online',
        lastSeen: new Date().toISOString()
      },
      memberSince: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'test_user_5',
      name: 'Tom Wilson',
      email: 'tom@example.com',
      avatar: 'TW',
      profession: 'Project Manager',
      company: 'Remote Agency',
      currentLocation: 'Chiang Mai',
      interests: ['Management', 'Travel', 'Coffee'],
      bio: 'Remote project manager helping teams work together across time zones.',
      onlineStatus: {
        isOnline: true,
        isAvailable: true,
        status: 'online',
        lastSeen: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      memberSince: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'test_user_6',
      name: 'Emma Thompson',
      email: 'emma@example.com',
      avatar: 'ET',
      profession: 'Graphic Designer',
      company: 'Creative Studio',
      currentLocation: 'Berlin',
      interests: ['Design', 'Art', 'Music'],
      bio: 'Creative designer bringing visual stories to life.',
      onlineStatus: {
        isOnline: false,
        isAvailable: false,
        status: 'away',
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      memberSince: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'test_user_7',
      name: 'James Brown',
      email: 'james@example.com',
      avatar: 'JB',
      profession: 'Data Analyst',
      company: 'Analytics Corp',
      currentLocation: 'Bali',
      interests: ['Data', 'Travel', 'Surfing'],
      bio: 'Data analyst who loves to surf and analyze trends.',
      onlineStatus: {
        isOnline: true,
        isAvailable: false,
        status: 'busy',
        lastSeen: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      memberSince: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'test_user_8',
      name: 'Lisa Zhang',
      email: 'lisa@example.com',
      avatar: 'LZ',
      profession: 'Product Manager',
      company: 'Startup Inc',
      currentLocation: 'Singapore',
      interests: ['Product', 'Innovation', 'Food'],
      bio: 'Product manager passionate about building products that matter.',
      onlineStatus: {
        isOnline: true,
        isAvailable: true,
        status: 'online',
        lastSeen: new Date().toISOString()
      },
      memberSince: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  // 保存测试用户到localStorage
  // REMOVED: localStorage usage for nomad_users)
  console.log('Initialized test users:', testUsers.length)
}

// 自动初始化（如果是在浏览器环境中）
if (typeof window !== 'undefined') {
  initializeTestUsers()
}
