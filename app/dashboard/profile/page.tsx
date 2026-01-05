'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { User, Upload, Github, Linkedin, Globe, GraduationCap, Edit2, ExternalLink, Mail, MapPin, Calendar } from 'lucide-react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    photo_url: '',
    github: '',
    linkedin: '',
    portfolio: '',
    about: '',
    education: '',
    full_name: '',
    location: '',
    email: '',
    joined_date: '',
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
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
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)

  const hasProfileData = profileData.full_name || profileData.about || profileData.github || profileData.linkedin || profileData.portfolio

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
            full_name: profile.full_name || '',
            location: profile.location || '',
            email: profile.email || '',
            joined_date: profile.joined_date || new Date().toISOString().split('T')[0],
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

  const getCroppedImg = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!completedCrop || !imgRef.current) {
        resolve('')
        return
      }

      const canvas = document.createElement('canvas')
      const image = imgRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      
      canvas.width = completedCrop.width
      canvas.height = completedCrop.height
      const ctx = canvas.getContext('2d')

      if (ctx) {
        ctx.drawImage(
          image,
          completedCrop.x * scaleX,
          completedCrop.y * scaleY,
          completedCrop.width * scaleX,
          completedCrop.height * scaleY,
          0,
          0,
          completedCrop.width,
          completedCrop.height
        )
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(blob)
        }
      }, 'image/jpeg')
    })
  }

  const handleCropSave = async () => {
    const croppedImage = await getCroppedImg()
    if (croppedImage) {
      setPhotoPreview(croppedImage)
      setProfileData(prev => ({ ...prev, photo_url: croppedImage }))
    }
    setShowCropDialog(false)
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
        setIsEditMode(false)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e3098] mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Profile</h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isEditMode ? 'Edit your personal information' : 'Manage your personal information and showcase your achievements'}
            </p>
          </div>
          {hasProfileData && !isEditMode && (
            <Button
              onClick={() => setIsEditMode(true)}
              className="bg-gradient-to-r from-[#3e3098] to-purple-600 hover:opacity-90 text-white"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {!hasProfileData && !isEditMode ? (
          <Card className="p-12 text-center bg-gradient-to-br from-purple-50/50 to-green-50/50 dark:from-purple-950/20 dark:to-green-950/20 border-slate-200/50 dark:border-slate-700/50">
            <User className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Complete Your Profile</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Add your information to showcase your achievements and connect with others
            </p>
            <Button
              onClick={() => setIsEditMode(true)}
              className="bg-gradient-to-r from-[#3e3098] to-purple-600 hover:opacity-90 text-white"
            >
              Get Started
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Profile Photo Card */}
            <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-green-50/50 dark:from-purple-950/20 dark:to-green-950/20 border-slate-200/50 dark:border-slate-700/50">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Photo
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3e3098] via-purple-600 to-green-500 p-1">
                    <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="w-12 h-12 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
                {isEditMode && (
                  <div className="flex-1">
                    <Label htmlFor="photo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Upload Photo
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="flex-1 bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      JPG, PNG or GIF. Max size 2MB. Image will be cropped to circle.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Basic Info Card */}
            {(isEditMode || profileData.full_name || profileData.email || profileData.location) && (
              <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-green-50/50 dark:from-purple-950/20 dark:to-green-950/20 border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Basic Information</h2>
                {isEditMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        value={profileData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="Mumbai, India"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profileData.full_name && (
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <User className="w-5 h-5 text-purple-600" />
                        <span className="font-medium">{profileData.full_name}</span>
                      </div>
                    )}
                    {profileData.email && (
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <span>{profileData.email}</span>
                      </div>
                    )}
                    {profileData.location && (
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                    {profileData.joined_date && (
                      <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span>Joined {new Date(profileData.joined_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Social Links Card */}
            {(isEditMode || profileData.github || profileData.linkedin || profileData.portfolio) && (
              <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-green-50/50 dark:from-purple-950/20 dark:to-green-950/20 border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Social Links</h2>
                {isEditMode ? (
                  <div className="space-y-4">
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
                        className="bg-white/50 dark:bg-slate-900/50"
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
                        className="bg-white/50 dark:bg-slate-900/50"
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
                        className="bg-white/50 dark:bg-slate-900/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profileData.github && (
                      <a
                        href={profileData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3e3098] to-purple-600 flex items-center justify-center">
                            <Github className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">GitHub</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{profileData.github.replace('https://github.com/', '@')}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
                      </a>
                    )}
                    {profileData.linkedin && (
                      <a
                        href={profileData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                            <Linkedin className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">LinkedIn</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{profileData.linkedin.replace('https://linkedin.com/in/', '')}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    )}
                    {profileData.portfolio && (
                      <a
                        href={profileData.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">Portfolio</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{profileData.portfolio.replace(/^https?:\/\//, '')}</p>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-green-600 transition-colors" />
                      </a>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* About Me Card */}
            {(isEditMode || profileData.about) && (
              <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-green-50/50 dark:from-purple-950/20 dark:to-green-950/20 border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">About Me</h2>
                {isEditMode ? (
                  <div>
                    <Label htmlFor="about" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Tell us about yourself
                    </Label>
                    <Textarea
                      id="about"
                      placeholder="Write a brief bio about yourself, your interests, and goals..."
                      rows={6}
                      value={profileData.about}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                      className="resize-none bg-white/50 dark:bg-slate-900/50"
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {profileData.about.length}/500 characters
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {profileData.about}
                  </p>
                )}
              </Card>
            )}

            {/* Education Card */}
            {(isEditMode || profileData.education) && (
              <Card className="p-6 bg-gradient-to-br from-purple-50/50 to-green-50/50 dark:from-purple-950/20 dark:to-green-950/20 border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </h2>
                {isEditMode ? (
                  <div>
                    <Label htmlFor="education" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                      Educational Background
                    </Label>
                    <Textarea
                      id="education"
                      placeholder="Share your educational qualifications, degrees, certifications..."
                      rows={4}
                      value={profileData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="resize-none bg-white/50 dark:bg-slate-900/50"
                    />
                  </div>
                ) : (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {profileData.education}
                  </p>
                )}
              </Card>
            )}

            {/* Action Buttons */}
            {isEditMode && (
              <div className="sticky bottom-4 flex justify-end gap-4 bg-gradient-to-r from-slate-50/95 via-purple-50/95 to-slate-50/95 dark:from-slate-950/95 dark:via-purple-950/95 dark:to-slate-950/95 backdrop-blur-sm p-4 rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditMode(false)
                    fetchProfile()
                  }} 
                  disabled={saving}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-[#3e3098] to-purple-600 hover:opacity-90 text-white px-8"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Crop Dialog */}
      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop Your Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {imageToCrop && (
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
                  className="max-h-[400px]"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCropDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCropSave}
              className="bg-gradient-to-r from-[#3e3098] to-purple-600 hover:opacity-90 text-white"
            >
              Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
