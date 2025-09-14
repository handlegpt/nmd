import { logInfo, logError } from './logger'
import { generateVerificationEmailTemplate } from './emailTemplates'

// 邮件发送接口
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// 验证码邮件发送函数
export async function sendVerificationEmail(
  email: string, 
  code: string, 
  locale: string = 'en'
): Promise<EmailSendResult> {
  try {
    // 检查环境变量
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      logError('RESEND_API_KEY not found in environment variables', null, 'EmailService')
      return {
        success: false,
        error: 'Email service not configured'
      }
    }


    // 生成邮件模板
    const emailTemplate = generateVerificationEmailTemplate({
      code,
      minutes: 10,
      locale
    })

    // 动态导入Resend，避免构建时错误
    console.log('📧 Importing Resend...')
    const { Resend } = await import('resend')
    console.log('📧 Resend imported successfully')
    
    const resend = new Resend(resendApiKey)
    console.log('📧 Resend client created')
    
    // 发送邮件
    console.log('📧 Sending email to:', email)
    console.log('📧 Email subject:', emailTemplate.subject)
    
    // 从环境变量获取发送域名，如果没有则使用默认值
    const fromEmail = process.env.RESEND_FROM || 'NOMAD.NOW <noreply@nomadnow.app>'
    console.log('📧 Using from email:', fromEmail)
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: emailTemplate.subject,
      html: emailTemplate.html
    })
    
    console.log('📧 Resend response - data:', data)
    console.log('📧 Resend response - error:', error)

    if (error) {
      console.error('❌ Resend API error details:', error)
      logError('Failed to send email via Resend', error, 'EmailService')
      return {
        success: false,
        error: `Failed to send verification code: ${error.message || 'Unknown error'}`
      }
    }

    logInfo('Email sent successfully via Resend', { 
      email, 
      messageId: data?.id,
      subject: emailTemplate.subject 
    }, 'EmailService')

    return {
      success: true,
      messageId: data?.id
    }

  } catch (error) {
    console.error('❌ Unexpected error in email service:', error)
    logError('Unexpected error in email service', error, 'EmailService')
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// 测试邮件发送函数
export async function sendTestEmail(email: string): Promise<EmailSendResult> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    
    if (!resendApiKey) {
      return {
        success: false,
        error: 'Email service not configured'
      }
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)
    
    // 从环境变量获取发送域名，如果没有则使用默认值
    const fromEmail = process.env.RESEND_FROM || 'NOMAD.NOW <noreply@nomadnow.app>'
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Test Email from NOMAD.NOW',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Test Email</h1>
          <p>This is a test email from NOMAD.NOW email service.</p>
          <p>If you received this email, the email service is working correctly!</p>
        </div>
      `
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      messageId: data?.id
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// 检查邮件服务配置
export function checkEmailServiceConfig(): {
  configured: boolean
  apiKey: boolean
  domain: boolean
} {
  const resendApiKey = process.env.RESEND_API_KEY
  
  return {
    configured: !!resendApiKey,
    apiKey: !!resendApiKey,
    domain: true // 暂时使用Resend的默认域名
  }
}
