import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Phone, MapPin, Briefcase, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AvatarUpload from './AvatarUpload';
import { 
  validateName, 
  validatePhone, 
  validateUrl, 
  validateCompany, 
  validateBio, 
  validateLocation, 
  sanitizeText 
} from '@/utils/inputValidation';

const ProfileTab = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    phone: '',
    location: '',
    bio: '',
    company: '',
    website: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setProfile({
          full_name: profileData?.full_name || '',
          email: user.email || '',
          avatar_url: profileData?.avatar_url || '',
          phone: profileData?.phone || '',
          location: profileData?.location || '',
          bio: profileData?.bio || '',
          company: profileData?.company || '',
          website: profileData?.website || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    const nameValidation = validateName(profile.full_name);
    if (!nameValidation.isValid) newErrors.full_name = nameValidation.message!;
    
    const phoneValidation = validatePhone(profile.phone);
    if (!phoneValidation.isValid) newErrors.phone = phoneValidation.message!;
    
    const urlValidation = validateUrl(profile.website);
    if (!urlValidation.isValid) newErrors.website = urlValidation.message!;
    
    const companyValidation = validateCompany(profile.company);
    if (!companyValidation.isValid) newErrors.company = companyValidation.message!;
    
    const bioValidation = validateBio(profile.bio);
    if (!bioValidation.isValid) newErrors.bio = bioValidation.message!;
    
    const locationValidation = validateLocation(profile.location);
    if (!locationValidation.isValid) newErrors.location = locationValidation.message!;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below before saving.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Sanitize input data
      const sanitizedProfile = {
        full_name: sanitizeText(profile.full_name),
        phone: sanitizeText(profile.phone),
        location: sanitizeText(profile.location),
        bio: sanitizeText(profile.bio),
        company: sanitizeText(profile.company),
        website: profile.website.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update(sanitizedProfile)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state with sanitized data
      setProfile(prev => ({ ...prev, ...sanitizedProfile }));

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    setProfile(prev => ({ ...prev, avatar_url: avatarUrl || '' }));
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            userName={profile.full_name}
            onAvatarUpdate={handleAvatarUpdate}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, full_name: e.target.value }));
                  if (errors.full_name) setErrors(prev => ({ ...prev, full_name: '' }));
                }}
                placeholder="Enter your full name"
                className={errors.full_name ? 'border-destructive' : ''}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.full_name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed from here
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile(prev => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="Enter your phone number"
                  className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => {
                    setProfile(prev => ({ ...prev, location: e.target.value }));
                    if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                  }}
                  placeholder="City, Country"
                  className={`pl-10 ${errors.location ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.location && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.location}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => {
                    setProfile(prev => ({ ...prev, company: e.target.value }));
                    if (errors.company) setErrors(prev => ({ ...prev, company: '' }));
                  }}
                  placeholder="Company name"
                  className={`pl-10 ${errors.company ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.company && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.company}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => {
                  setProfile(prev => ({ ...prev, website: e.target.value }));
                  if (errors.website) setErrors(prev => ({ ...prev, website: '' }));
                }}
                placeholder="https://yourwebsite.com"
                className={errors.website ? 'border-destructive' : ''}
              />
              {errors.website && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.website}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => {
                setProfile(prev => ({ ...prev, bio: e.target.value }));
                if (errors.bio) setErrors(prev => ({ ...prev, bio: '' }));
              }}
              placeholder="Tell us about yourself..."
              className={`w-full p-3 border border-input rounded-lg resize-none focus:ring-2 focus:ring-ring bg-background min-h-[100px] ${errors.bio ? 'border-destructive' : ''}`}
            />
            <div className="flex justify-between items-center">
              {errors.bio && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.bio}
                </p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {profile.bio.length}/1000 characters
              </p>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert className="border-warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the validation errors above before saving your profile.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving || Object.keys(errors).length > 0}
              className="min-w-[120px]"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;