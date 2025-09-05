import CryptoJS from 'crypto-js'
import { logInfo, logError } from './logger'

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'nomad-now-encryption-key-2024'

// 加密数据
export function encryptData(data: any): string {
  try {
    const jsonString = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
    
    logInfo('Data encrypted successfully', { dataSize: jsonString.length }, 'Encryption')
    return encrypted
  } catch (error) {
    logError('Failed to encrypt data', error, 'Encryption')
    throw new Error('Encryption failed')
  }
}

// 解密数据
export function decryptData<T>(encryptedData: string): T | null {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!jsonString) {
      logError('Decrypted data is empty', null, 'Encryption')
      return null
    }
    
    const data = JSON.parse(jsonString) as T
    logInfo('Data decrypted successfully', { dataSize: jsonString.length }, 'Encryption')
    return data
  } catch (error) {
    logError('Failed to decrypt data', error, 'Encryption')
    return null
  }
}

// 加密本地存储数据
export function encryptLocalStorage(key: string, data: any): void {
  try {
    const encrypted = encryptData(data)
    localStorage.setItem(key, encrypted)
    logInfo('Data stored in localStorage successfully', { key }, 'Encryption')
  } catch (error) {
    logError('Failed to store encrypted data', error, 'Encryption')
    throw error
  }
}

// 解密本地存储数据
export function decryptLocalStorage<T>(key: string): T | null {
  try {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null
    
    return decryptData<T>(encrypted)
  } catch (error) {
    logError('Failed to retrieve encrypted data', error, 'Encryption')
    return null
  }
}

// 安全删除本地存储数据
export function secureRemoveLocalStorage(key: string): void {
  try {
    const encrypted = localStorage.getItem(key)
    if (encrypted) {
      // 用随机数据覆盖后再删除
      const randomData = CryptoJS.lib.WordArray.random(encrypted.length).toString()
      localStorage.setItem(key, randomData)
    }
    localStorage.removeItem(key)
    logInfo('Data securely removed from localStorage', { key }, 'Encryption')
  } catch (error) {
    logError('Failed to securely remove data', error, 'Encryption')
  }
}

// 清空所有加密数据
export function clearAllEncryptedData(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('nomad_now_')) {
        secureRemoveLocalStorage(key)
      }
    })
    logInfo('All encrypted data cleared successfully', null, 'Encryption')
  } catch (error) {
    logError('Failed to clear encrypted data', error, 'Encryption')
  }
}
