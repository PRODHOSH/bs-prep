'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User, Upload, Github, Linkedin, Globe, GraduationCap, Edit2, Check, X } from 'lucide-react'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    photo_url: '',
    github: '',
    linkedin: '',
    portfolio: '',
    about: '',
    education: '',
  })

  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Image cropping states
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string>('')
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  })
  const [completedCrop, setCompletedCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const { profile } = await response.json()
        if (profile) {
          setProfileData({
            photo_url: profile.photo_url || '',
            github: profile.github || '',
            linkedin: profile.linkedin || '',
            portfolio: profile.portfolio || '',
            about: profile.about || '',
            education: profile.education || '',
          })
          if (profile.photo_url) {
            setPhotoPreview(profile.photo_url)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageToCrop(reader.result as string)
        setShowCropDialog(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCroppedImg = (): string | null => {
    if (!completedCrop || !imgRef.current) return null

    const canvas = document.createElement('canvas')
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height
    canvas.width = completedCrop.width
    canvas.height = completedCrop.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    return canvas.toDataURL('image/jpeg')
  }

  const handleCropComplete = () => {
    const croppedImage = getCroppedImg()
    if (croppedImage) {
      setPhotoPreview(croppedImage)
      setProfileData(prev => ({ ...prev, photo_url: croppedImage }))
      setShowCropDialog(false)
      setImageToCrop('')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        alert('Profile saved successfully!')
        setIsEditing(false)
        await fetchProfile()
      } else {
        alert('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e3098] mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your personal information and showcase your achievements
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {!isEditing ? (
        // View Mode - Clean Display
        <div className="space-y-6">
          {/* Profile Photo Display */}
          <Card className="p-8 bg-gradient-to-br from-[#3e3098]/5 to-[#51b206]/5 border-[#3e3098]/20">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3e3098] to-[#51b206] p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Your Profile Photo
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {photoPreview ? 'Looking great!' : 'Upload a photo to personalize your profile'}
                </p>
              </div>
            </div>
          </Card>

          {/* Social Links Display */}
          {(profileData.github || profileData.linkedin || profileData.portfolio) && (
            <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#3e3098]" />
                Social Links
              </h2>
              <div className="grid gap-4">
                {profileData.github && (
                  <a 
                    href={profileData.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
                  >
                    <Github className="w-5 h-5 text-slate-900 dark:text-white" />
                    <span className="text-slate-700 dark:text-slate-300">{profileData.github}</span>
                  </a>
                )}
                {profileData.linkedin && (
                  <a 
                    href={profileData.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
                  >
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <span className="text-slate-700 dark:text-slate-300">{profileData.linkedin}</span>
                  </a>
                )}
                {profileData.portfolio && (
                  <a 
                    href={profileData.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 hover:shadow-md transition-shadow"
                  >
                    <Globe className="w-5 h-5 text-[#51b206]" />
                    <span className="text-slate-700 dark:text-slate-300">{profileData.portfolio}</span>
                  </a>
                )}
              </div>
            </Card>
          )}

          {/* About Me Display */}
          {profileData.about && (
            <Card className="p-8 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/30 dark:border-purple-800/30">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About Me</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {profileData.about}
              </p>
            </Card>
          )}

          {/* Education Display */}
          {profileData.education && (
            <Card className="p-8 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/30 dark:border-blue-800/30">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-[#3e3098]" />
                Education
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {profileData.education}
              </p>
            </Card>
          )}

          {/* Empty State */}
          {!profileData.about && !profileData.education && !profileData.github && !profileData.linkedin && !profileData.portfolio && (
            <Card className="p-12 text-center bg-gradient-to-br from-[#3e3098]/5 to-[#51b206]/5 border-[#3e3098]/20">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Complete Your Profile
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Add your information to showcase your achievements and connect with others
              </p>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white"
              >
                Get Started
              </Button>
            </Card>
          )}
        </div>
      ) : (
        // Edit Mode - Forms
        <div className="space-y-6">
          {/* Profile Photo Card */}
          <Card className="p-8 bg-gradient-to-br from-[#3e3098]/5 to-[#51b206]/5 border-[#3e3098]/20">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Photo
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3e3098] to-[#51b206] p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <Label htmlFor="photo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Upload Photo
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="photo" className="flex-1">
                    <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Choose File</span>
                    </div>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                  JPG, PNG or GIF. Max size 2MB. Image will be cropped to square.
                </p>
              </div>
            </div>
          </Card>

          {/* Social Links Card */}
          <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Social Links</h2>
            <div className="space-y-5">
              <div>
                <Label htmlFor="github" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={profileData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourusername"
                  value={profileData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="portfolio" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Globe className="w-4 h-4" />
                  Portfolio Website
                </Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profileData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </Card>

          {/* About Me Card */}
          <Card className="p-8 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200/30 dark:border-purple-800/30">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">About Me</h2>
            <div>
              <Label htmlFor="about" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                Tell us about yourself
              </Label>
              <Textarea
                id="about"
                placeholder="Write a brief bio about yourself, your interests, and goals..."
                rows={6}
                value={profileData.about}
                onChange={(e) => handleInputChange('about', e.target.value)}
                className="resize-none"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {profileData.about.length}/500 characters
              </p>
            </div>
          </Card>

          {/* Education Card */}
          <Card className="p-8 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200/30 dark:border-blue-800/30">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </h2>
            <div>
              <Label htmlFor="education" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                Educational Background
              </Label>
              <Textarea
                id="education"
                placeholder="Share your educational qualifications, degrees, certifications..."
                rows={4}
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                className="resize-none"
              />
            </div>
          </Card>

          {/* Save/Cancel Buttons */}
          <div className="flex justify-end gap-4 sticky bottom-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false)
                fetchProfile()
              }} 
              disabled={saving}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white px-8 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}

      {/* Image Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Your Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imageToCrop && (
              <div className="max-h-96 overflow-auto">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imageToCrop}
                    alt="Crop preview"
                    className="max-w-full"
                  />
                </ReactCrop>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropDialog(false)
                  setImageToCrop('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropComplete}
                className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white"
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
