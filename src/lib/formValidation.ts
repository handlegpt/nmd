import { logInfo, logError } from '@/lib/logger'
import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  custom?: (value: any) => string | null
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface FormField {
  name: string
  value: any
  rules: ValidationRule
}

// 预定义的验证规则
export const validationRules = {
  email: {
    required: true,
    email: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/
  },
  verificationCode: {
    required: true,
    pattern: /^\d{6}$/
  },
  cityName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  placeName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  wifiSpeed: {
    required: false,
    custom: (value: any) => {
      if (value && (isNaN(value) || value < 0 || value > 1000)) {
        return 'WiFi速度必须在0-1000 Mbps之间'
      }
      return null
    }
  },
  priceLevel: {
    required: false,
    custom: (value: any) => {
      if (value && (isNaN(value) || value < 1 || value > 5)) {
        return '价格等级必须在1-5之间'
      }
      return null
    }
  }
}

// 验证单个字段
export function validateField(field: FormField): string | null {
  const { name, value, rules } = field

  // 必填验证
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return `${name}是必填项`
  }

  // 如果值为空且不是必填，则跳过其他验证
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null
  }

  // 最小长度验证
  if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
    return `${name}至少需要${rules.minLength}个字符`
  }

  // 最大长度验证
  if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
    return `${name}不能超过${rules.maxLength}个字符`
  }

  // 邮箱验证
  if (rules.email && !validationRules.email.pattern!.test(value)) {
    return '请输入有效的邮箱地址'
  }

  // URL验证
  if (rules.url) {
    try {
      new URL(value)
    } catch {
      return '请输入有效的URL'
    }
  }

  // 正则表达式验证
  if (rules.pattern && !rules.pattern.test(value)) {
    return `${name}格式不正确`
  }

  // 自定义验证
  if (rules.custom) {
    const customError = rules.custom(value)
    if (customError) {
      return customError
    }
  }

  return null
}

// 验证整个表单
export function validateForm(fields: FormField[]): ValidationResult {
  const errors: Record<string, string> = {}
  let isValid = true

  fields.forEach(field => {
    const error = validateField(field)
    if (error) {
      errors[field.name] = error
      isValid = false
    }
  })

  return { isValid, errors }
}

// 实时验证Hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, ValidationRule>
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validate = useCallback((fieldName?: keyof T) => {
    if (fieldName) {
      // 验证单个字段
      const field: FormField = {
        name: fieldName as string,
        value: values[fieldName],
        rules: validationSchema[fieldName]
      }
      const error = validateField(field)
      setErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }))
      return !error
    } else {
      // 验证整个表单
      const fields: FormField[] = Object.keys(validationSchema).map(key => ({
        name: key,
        value: values[key],
        rules: validationSchema[key]
      }))
      const result = validateForm(fields)
      setErrors(result.errors)
      return result.isValid
    }
  }, [values, validationSchema])

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    // 如果字段已经被触摸过，立即验证
    if (touched[name as string]) {
      validate(name)
    }
  }, [touched, validate])

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    validate(name)
  }, [validate])

  const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
    const isValid = validate()
    if (isValid) {
      onSubmit(values)
    }
  }, [values, validate])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0
  }
}


