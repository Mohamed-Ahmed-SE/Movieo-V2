import { useState } from 'react'
import { usePageTransition } from '../hooks/useGSAP'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import * as Switch from '@radix-ui/react-switch'
import { Moon, Sun, Play, Eye, EyeOff, Mail, BellOff, Save, RotateCcw } from 'lucide-react'
import { updateSetting, resetSettings } from '../store/slices/settingsSlice'
import Button from '../components/common/Button'

const Settings = () => {
  usePageTransition()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const settings = useSelector((state) => state.settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleToggle = (key, value) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    setHasChanges(true)
  }

  const handleApply = () => {
    Object.entries(localSettings).forEach(([key, value]) => {
      if (settings[key] !== value) {
        dispatch(updateSetting({ key, value }))
      }
    })
    setHasChanges(false)
    // Apply theme immediately
    if (localSettings.theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }

  const handleReset = () => {
    dispatch(resetSettings())
    setLocalSettings(settings)
    setHasChanges(false)
  }

  const SettingItem = ({ icon: Icon, title, description, checked, onCheckedChange, disabled = false }) => (
    <div className={`p-4 sm:p-6 border-b border-white/5 flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="min-w-0 flex-1 flex items-center gap-3 sm:gap-4">
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white mb-1">{title}</h3>
          <p className="text-xs sm:text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="w-11 h-6 bg-zinc-800 rounded-full relative data-[state=checked]:bg-primary outline-none cursor-pointer disabled:cursor-not-allowed border border-white/10"
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-200 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
      </Switch.Root>
    </div>
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-zinc-400 text-sm sm:text-base">Customize your experience</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden mb-6">
          {/* Theme Setting */}
          <SettingItem
            icon={localSettings.theme === 'dark' ? Moon : Sun}
            title="Theme"
            description={localSettings.theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
            checked={localSettings.theme === 'light'}
            onCheckedChange={(checked) => handleToggle('theme', checked ? 'light' : 'dark')}
          />

          {/* Auto-play Trailers */}
          <SettingItem
            icon={Play}
            title="Auto-play Trailers"
            description="Automatically play trailers on hover"
            checked={localSettings.autoPlayTrailers}
            onCheckedChange={(checked) => handleToggle('autoPlayTrailers', checked)}
          />

          {/* Show Adult Content */}
          <SettingItem
            icon={localSettings.showAdultContent ? Eye : EyeOff}
            title="Show Adult Content"
            description="Display 18+ content in search results"
            checked={localSettings.showAdultContent}
            onCheckedChange={(checked) => handleToggle('showAdultContent', checked)}
          />

          {/* Email Notifications */}
          <SettingItem
            icon={localSettings.emailNotifications ? Mail : BellOff}
            title="Email Notifications"
            description="Receive updates via email"
            checked={localSettings.emailNotifications}
            onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
          />
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleApply}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-bold flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Apply Changes
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-white/20 hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
export default Settings


