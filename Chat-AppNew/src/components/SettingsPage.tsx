// src/components/SettingsPage.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Settings, Lock, Mail, Bell, Palette, Database, X, Check } from 'lucide-react';

interface SettingsPageProps {
  user: any;
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'appearance' | 'advanced'>('account');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    mentions: true,
    sounds: true
  });

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert(`Error updating password: ${error.message}`);
    } else {
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsUpdating(false);
  };

  const handleNotificationChange = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-md p-4 border-b border-slate-700 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row p-4 gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 bg-slate-800/50 border border-slate-700 rounded-xl p-4 h-fit">
          <div className="space-y-1">
            <button
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'account' 
                  ? 'bg-cyan-600/20 text-cyan-400' 
                  : 'text-gray-300 hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab('account')}
            >
              <Lock className="w-5 h-5" />
              <span>Account</span>
            </button>
            <button
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'privacy' 
                  ? 'bg-purple-600/20 text-purple-400' 
                  : 'text-gray-300 hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab('privacy')}
            >
              <Lock className="w-5 h-5" />
              <span>Privacy & Security</span>
            </button>
            <button
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'notifications' 
                  ? 'bg-pink-600/20 text-pink-400' 
                  : 'text-gray-300 hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>
            <button
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'appearance' 
                  ? 'bg-amber-600/20 text-amber-400' 
                  : 'text-gray-300 hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette className="w-5 h-5" />
              <span>Appearance</span>
            </button>
            <button
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === 'advanced' 
                  ? 'bg-emerald-600/20 text-emerald-400' 
                  : 'text-gray-300 hover:bg-slate-700/50'
              }`}
              onClick={() => setActiveTab('advanced')}
            >
              <Database className="w-5 h-5" />
              <span>Advanced</span>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Account Settings
              </h2>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-3 text-cyan-400">
                    Email Address
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                      Change
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-3 text-purple-400">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={updatePassword}
                      disabled={isUpdating || !currentPassword || !newPassword || newPassword !== confirmPassword}
                      className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                    >
                      {isUpdating ? 'Updating...' : 'Change Password'}
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-3 text-rose-400">
                    Danger Zone
                  </h3>
                  <div className="space-y-4">
                    <button className="w-full text-left p-3 bg-rose-900/30 border border-rose-700/30 rounded-lg flex items-center justify-between hover:bg-rose-800/50 transition-colors">
                      <span>Deactivate Account</span>
                      <span className="text-rose-400 text-sm">Temporary disable</span>
                    </button>
                    <button className="w-full text-left p-3 bg-rose-900/30 border border-rose-700/30 rounded-lg flex items-center justify-between hover:bg-rose-800/50 transition-colors">
                      <span>Delete Account</span>
                      <span className="text-rose-400 text-sm">Permanent action</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </h2>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-pink-400">
                    Message Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">New Messages</div>
                        <div className="text-sm text-gray-400">Notify me about new messages</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.messages}
                          onChange={() => handleNotificationChange('messages')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Mentions</div>
                        <div className="text-sm text-gray-400">Notify me when I'm mentioned</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.mentions}
                          onChange={() => handleNotificationChange('mentions')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-amber-400">
                    Sound & Alerts
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notification Sounds</div>
                      <div className="text-sm text-gray-400">Play sounds for new notifications</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={notificationSettings.sounds}
                        onChange={() => handleNotificationChange('sounds')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </h2>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-amber-400">
                    Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-lg border flex flex-col items-center ${
                        theme === 'light' 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-slate-600 hover:border-amber-400'
                      }`}
                    >
                      <div className="bg-white w-16 h-10 rounded mb-2"></div>
                      <span>Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-lg border flex flex-col items-center ${
                        theme === 'dark' 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-slate-600 hover:border-amber-400'
                      }`}
                    >
                      <div className="bg-slate-800 w-16 h-10 rounded mb-2"></div>
                      <span>Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 rounded-lg border flex flex-col items-center ${
                        theme === 'system' 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-slate-600 hover:border-amber-400'
                      }`}
                    >
                      <div className="bg-gradient-to-r from-white to-slate-800 w-16 h-10 rounded mb-2"></div>
                      <span>System</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-violet-400">
                    Accent Color
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {['purple', 'cyan', 'pink', 'amber', 'emerald'].map(color => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full bg-${color}-500`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy & Security
              </h2>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-cyan-400">
                    Privacy Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Online Status</div>
                        <div className="text-sm text-gray-400">Show when you're online</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Read Receipts</div>
                        <div className="text-sm text-gray-400">Show when you've seen messages</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          defaultChecked
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-emerald-400">
                    Security
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-400">Add extra security to your account</div>
                      </div>
                      <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                        Enable
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Active Sessions</div>
                        <div className="text-sm text-gray-400">Manage your logged-in devices</div>
                      </div>
                      <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Advanced Settings */}
          {activeTab === 'advanced' && (
            <div>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Advanced Settings
              </h2>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-emerald-400">
                    Data Management
                  </h3>
                  <div className="space-y-4">
                    <button className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center justify-between hover:bg-slate-700 transition-colors">
                      <span>Export Data</span>
                      <span className="text-emerald-400 text-sm">Download your information</span>
                    </button>
                    <button className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center justify-between hover:bg-slate-700 transition-colors">
                      <span>Clear Cache</span>
                      <span className="text-emerald-400 text-sm">Free up storage space</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <h3 className="font-medium text-lg mb-4 text-rose-400">
                    Developer Options
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Developer Mode</div>
                        <div className="text-sm text-gray-400">Enable advanced debugging tools</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                      </label>
                    </div>
                    
                    <button className="w-full text-left p-3 bg-slate-700/50 border border-slate-600 rounded-lg flex items-center justify-between hover:bg-slate-700 transition-colors">
                      <span>API Access</span>
                      <span className="text-rose-400 text-sm">Manage application keys</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;