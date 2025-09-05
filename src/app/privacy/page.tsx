'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Shield, Lock, Eye, UserCheck, Cookie, Mail, Calendar } from 'lucide-react'

export default function PrivacyPage() {
  const { t } = useTranslation()
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('privacy.subtitle')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {t('privacy.lastUpdated', { date: currentDate })}
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('privacy.introduction.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('privacy.introduction.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Information We Collect */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.informationWeCollect.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.informationWeCollect.description')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('privacy.informationWeCollect.personalInfo.title')}</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">姓名和联系信息</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">个人资料信息（职业、技能、兴趣）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">位置数据（当您选择分享时）</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">旅行偏好和历史</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t('privacy.informationWeCollect.usageData.title')}</h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">访问的页面和使用的功能</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">搜索查询和偏好</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">设备信息和浏览器类型</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">IP地址和大致位置</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.howWeUseInfo.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.howWeUseInfo.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">1</span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">提供和维护我们的服务</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">2</span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">个性化您的体验</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">改进我们的平台和功能</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">4</span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">发送重要更新和通知</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">5</span>
                </div>
                <span className="text-gray-600 dark:text-gray-300">回应您的询问和支持请求</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Data Sharing */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.dataSharing.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.dataSharing.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">在您明确同意的情况下</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">为了遵守法律义务</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">为了保护我们的权利和安全</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">与协助运营我们平台的服务提供商（在严格的保密协议下）</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Data Security */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.dataSecurity.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.dataSecurity.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">传输和存储数据的加密</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">定期安全评估和更新</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">访问控制和身份验证</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">安全的数据存储和备份程序</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.yourRights.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.yourRights.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">访问和审查您的个人信息</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">更新或更正您的信息</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">删除您的账户和关联数据</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">选择退出某些通信</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-600 dark:text-gray-300">控制位置共享和权限</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Cookies */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.cookies.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.cookies.description')}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.cookies.types.essential')}</h4>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.cookies.types.analytics')}</h4>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{t('privacy.cookies.types.preferences')}</h4>
            </div>
          </div>
        </div>

        {/* Contact Us */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('privacy.contactUs.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {t('privacy.contactUs.description')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-300">
                <strong>{t('privacy.contactUs.email')}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                <strong>{t('privacy.contactUs.address')}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
