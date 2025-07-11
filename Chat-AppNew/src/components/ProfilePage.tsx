// src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Edit2, Save, X, Camera, Globe, BookOpen, UserPlus } from 'lucide-react';

interface ProfilePageProps {
  user: any;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack }) => {
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    bio: '',
    website: '',
    avatar_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url);
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [user.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAvatarPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    setProfile(prev => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
  };

  const saveProfile = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ ...profile, id: user.id, updated_at: new Date().toISOString() });

    if (!error) {
      setIsEditing(false);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

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
            <User className="w-5 h-5" />
            Your Profile
          </h1>
          {isEditing ? (
            <button 
              onClick={saveProfile}
              className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 transition-all"
              disabled={isLoading}
            >
              <Save className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {user.email[0].toUpperCase()}
                </span>
              )}
            </div>
            
            {isEditing && (
              <label 
                className="absolute bottom-0 right-0 bg-slate-800 rounded-full p-2 cursor-pointer group-hover:bg-slate-700 transition-colors"
                title="Change avatar"
              >
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-1">
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="bg-transparent border-b border-slate-600 focus:border-cyan-500 text-center focus:outline-none"
                />
              ) : (
                profile.full_name || user.email.split('@')[0]
              )}
            </h2>
            <p className="text-slate-400">
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className="bg-transparent border-b border-slate-600 focus:border-cyan-500 text-center focus:outline-none"
                />
              ) : (
                `@${profile.username || 'user'}`
              )}
            </p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Bio
          </h3>
          {isEditing ? (
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          ) : (
            <p className="text-gray-300">
              {profile.bio || "No bio yet. Write something about yourself!"}
            </p>
          )}
        </div>

        {/* Website Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            Website
          </h3>
          {isEditing ? (
            <input
              type="url"
              name="website"
              value={profile.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          ) : profile.website ? (
            <a 
              href={profile.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              {profile.website}
            </a>
          ) : (
            <p className="text-gray-300">No website added</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">42</div>
            <div className="text-gray-400 text-sm">Connections</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">18</div>
            <div className="text-gray-400 text-sm">Groups</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">127</div>
            <div className="text-gray-400 text-sm">Messages</div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-teal-900/30 border border-cyan-700/30 rounded-xl p-5">
          <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-300" />
            Contact Card
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-cyan-300">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Member Since:</span>
              <span className="text-cyan-300">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Active:</span>
              <span className="text-cyan-300">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;