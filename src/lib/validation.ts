import { z } from 'zod'

// 基础验证模式
export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const nameSchema = z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name too long')

// 验证码模式
export const verificationCodeSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must contain only digits'),
  locale: z.enum(['en', 'zh', 'ja', 'es']).default('en').transform(val => val || 'en')
})

// 用户注册模式
export const userRegistrationSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  currentCity: z.string().optional(),
  preferences: z.object({
    wifi: z.number().min(0).max(100),
    cost: z.number().min(0).max(100),
    climate: z.number().min(0).max(100),
    social: z.number().min(0).max(100),
    visa: z.number().min(0).max(100)
  }).optional()
})

// 签证信息模式
export const visaSchema = z.object({
  country: z.string().min(2, 'Country must be at least 2 characters'),
  visa_type: z.string().min(2, 'Visa type must be at least 2 characters'),
  expiry_date: z.string().datetime('Invalid date format'),
  status: z.enum(['active', 'expired', 'expiring'])
})

// 城市投票模式
export const cityVoteSchema = z.object({
  city_id: z.string().uuid('Invalid city ID'),
  overall_rating: z.number().min(1).max(5),
  wifi_rating: z.number().min(1).max(5),
  social_rating: z.number().min(1).max(5),
  value_rating: z.number().min(1).max(5),
  climate_rating: z.number().min(1).max(5),
  comment: z.string().max(500, 'Comment too long').optional()
})

// 地点推荐模式
export const placeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['cafe', 'coworking', 'coliving', 'hostel', 'hotel', 'restaurant', 'library', 'park', 'university', 'shopping', 'other']),
  city_id: z.string().uuid('Invalid city ID'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.array(z.string()).max(10, 'Too many tags'),
  wifi_speed: z.number().positive().optional(),
  price_level: z.number().min(1).max(5),
  noise_level: z.enum(['quiet', 'moderate', 'loud']),
  social_atmosphere: z.enum(['low', 'medium', 'high'])
})

// 地点投票模式
export const placeVoteSchema = z.object({
  place_id: z.string().uuid('Invalid place ID'),
  vote_type: z.enum(['upvote', 'downvote']),
  comment: z.string().max(200, 'Comment too long').optional()
})

// 用户偏好模式
export const userPreferencesSchema = z.object({
  wifi: z.number().min(0).max(100),
  cost: z.number().min(0).max(100),
  climate: z.number().min(0).max(100),
  social: z.number().min(0).max(100),
  visa: z.number().min(0).max(100)
})

// 搜索参数模式
export const searchParamsSchema = z.object({
  query: z.string().max(100, 'Search query too long'),
  filters: z.record(z.any()).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

// 通用验证函数
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// 安全验证函数（用于API端点）
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(err => err.message).join(', ')}`)
    }
    throw new Error('Validation failed')
  }
}
