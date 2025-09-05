interface EmailTemplateData {
  code: string
  minutes: number
  locale: string
}

interface EmailTranslations {
  subject: string
  title: string
  subtitle: string
  verificationCode: string
  expiresIn: string
  ignoreMessage: string
}

const emailTranslations: Record<string, EmailTranslations> = {
  zh: {
    subject: 'NOMAD.NOW 验证码',
    title: 'NOMAD.NOW',
    subtitle: '您的验证码',
    verificationCode: '验证码',
    expiresIn: '此验证码将在 {minutes} 分钟后过期',
    ignoreMessage: '如果您没有请求此验证码，请忽略此邮件。'
  },
  en: {
    subject: 'NOMAD.NOW Verification Code',
    title: 'NOMAD.NOW',
    subtitle: 'Your Verification Code',
    verificationCode: 'Verification Code',
    expiresIn: 'This code will expire in {minutes} minutes',
    ignoreMessage: 'If you didn\'t request this code, please ignore this email.'
  },
  ja: {
    subject: 'NOMAD.NOW 認証コード',
    title: 'NOMAD.NOW',
    subtitle: '認証コード',
    verificationCode: '認証コード',
    expiresIn: 'このコードは{minutes}分後に期限切れになります',
    ignoreMessage: 'このコードをリクエストしていない場合は、このメールを無視してください。'
  },
  es: {
    subject: 'NOMAD.NOW Código de Verificación',
    title: 'NOMAD.NOW',
    subtitle: 'Tu Código de Verificación',
    verificationCode: 'Código de Verificación',
    expiresIn: 'Este código expirará en {minutes} minutos',
    ignoreMessage: 'Si no solicitaste este código, por favor ignora este email.'
  }
}

export function generateVerificationEmailTemplate({ code, minutes, locale }: EmailTemplateData) {
  const t = emailTranslations[locale] || emailTranslations.en
  
  const expiresInText = t.expiresIn.replace('{minutes}', minutes.toString())
  
  return {
    subject: t.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${t.title}</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${t.subtitle}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">${t.verificationCode}</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</span>
          </div>
          
          <p style="color: #666; margin: 20px 0; text-align: center;">
            ${expiresInText}
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              ${t.ignoreMessage}
            </p>
          </div>
        </div>
      </div>
    `
  }
}

export function getEmailTranslation(locale: string, key: string): string {
  const translations = {
    zh: {
      invalidEmail: '请输入有效的邮箱地址',
      sendCodeFailed: '发送验证码失败，请重试',
      databaseError: '数据库配置错误，请联系管理员',
      connectionError: '数据库连接失败，请重试',
      verificationFailed: '验证码验证失败',
      invalidOrExpired: '验证码无效或已过期',
      userCreationFailed: '创建用户失败',
      userVerificationFailed: '用户验证失败',
      verificationSuccess: '验证成功！欢迎使用Nomad Now'
    },
    en: {
      invalidEmail: 'Please enter a valid email address',
      sendCodeFailed: 'Failed to send verification code, please try again',
      databaseError: 'Database configuration error, please contact administrator',
      connectionError: 'Database connection failed, please try again',
      verificationFailed: 'Verification code validation failed',
      invalidOrExpired: 'Verification code is invalid or expired',
      userCreationFailed: 'Failed to create user',
      userVerificationFailed: 'User verification failed',
      verificationSuccess: 'Verification successful! Welcome to Nomad Now'
    },
    ja: {
      invalidEmail: '有効なメールアドレスを入力してください',
      sendCodeFailed: '認証コードの送信に失敗しました。再試行してください',
      databaseError: 'データベース設定エラー、管理者にお問い合わせください',
      connectionError: 'データベース接続に失敗しました。再試行してください',
      verificationFailed: '認証コードの検証に失敗しました',
      invalidOrExpired: '認証コードが無効または期限切れです',
      userCreationFailed: 'ユーザーの作成に失敗しました',
      userVerificationFailed: 'ユーザー認証に失敗しました',
      verificationSuccess: '認証成功！Nomad Nowへようこそ'
    },
    es: {
      invalidEmail: 'Por favor ingresa una dirección de email válida',
      sendCodeFailed: 'Error al enviar código de verificación, por favor intenta de nuevo',
      databaseError: 'Error de configuración de base de datos, por favor contacta al administrador',
      connectionError: 'Error de conexión a la base de datos, por favor intenta de nuevo',
      verificationFailed: 'Error en la validación del código de verificación',
      invalidOrExpired: 'El código de verificación es inválido o ha expirado',
      userCreationFailed: 'Error al crear usuario',
      userVerificationFailed: 'Error en la verificación del usuario',
      verificationSuccess: '¡Verificación exitosa! Bienvenido a Nomad Now'
    }
  }
  
  const localeTranslations = translations[locale as keyof typeof translations] || translations.en
  return localeTranslations[key as keyof typeof localeTranslations] || key
}
