'use client'

interface FormFieldProps {
  name: string
  label: string
  type?: string
  value: any
  error?: string
  touched?: boolean
  onChange: (name: string, value: any) => void
  onBlur: (name: string) => void
  placeholder?: string
  required?: boolean
  [key: string]: any
}

export default function FormField({
  name,
  label,
  type = 'text',
  value,
  error,
  touched,
  onChange,
  onBlur,
  placeholder,
  required = false,
  ...props
}: FormFieldProps) {
  const showError = touched && error

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          showError ? 'border-red-300' : 'border-gray-300'
        }`}
        {...props}
      />
      {showError && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
