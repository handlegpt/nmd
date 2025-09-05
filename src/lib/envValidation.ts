import { z } from 'zod'

// 环境变量验证模式
const envSchema = z.object({
  // Supabase配置
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  
  // JWT配置
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  
  // 加密配置
  NEXT_PUBLIC_ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters'),
  
  // 邮件服务配置
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  
  // 可选配置
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_OPENWEATHER_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // 端口配置
  PORT: z.string().transform(val => parseInt(val, 10)).pipe(z.number().min(1).max(65535)).optional(),
})

// 验证环境变量
export function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    
    // 额外的验证逻辑
    if (env.NODE_ENV === 'production') {
      if (!env.NEXT_PUBLIC_APP_URL) {
        throw new Error('NEXT_PUBLIC_APP_URL is required in production')
      }
      
      if (env.NEXT_PUBLIC_APP_URL.startsWith('http://')) {
        throw new Error('Production must use HTTPS')
      }
    }
    
    return { success: true, env }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`)
    }
    throw error
  }
}

// 获取验证后的环境变量
export function getValidatedEnv() {
  const result = validateEnv()
  return result.env
}

// 检查环境变量是否已设置
export function checkRequiredEnvVars(): string[] {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'JWT_SECRET',
    'NEXT_PUBLIC_ENCRYPTION_KEY',
    'RESEND_API_KEY'
  ]
  
  const missing = requiredVars.filter(varName => !process.env[varName])
  return missing
}

// 生成环境变量示例
export function generateEnvExample(): string {
  return `# NOMAD.NOW Environment Variables
# Copy this file to .env.local for local development
# Copy this file to .env for Docker deployment

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# JWT Configuration (Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Encryption Configuration (Generate with: openssl rand -base64 32)
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key-2024

# Email Service Configuration
RESEND_API_KEY=your-resend-api-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3011
NODE_ENV=development

# Optional: Weather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-openweather-api-key-here

# Production Configuration
# For production, set these values:
# NEXT_PUBLIC_APP_URL=https://your-domain.com
# NODE_ENV=production
`
}

// 验证单个环境变量
export function validateSingleEnvVar(name: string, value: string | undefined): boolean {
  try {
    switch (name) {
      case 'NEXT_PUBLIC_SUPABASE_URL':
        return z.string().url().safeParse(value).success
      
      case 'JWT_SECRET':
        return z.string().min(32).safeParse(value).success
      
      case 'NEXT_PUBLIC_ENCRYPTION_KEY':
        return z.string().min(32).safeParse(value).success
      
      case 'NODE_ENV':
        return z.enum(['development', 'production', 'test']).safeParse(value).success
      
      default:
        return !!value
    }
  } catch {
    return false
  }
}
