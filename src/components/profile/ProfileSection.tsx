import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getUserProfile, updateUserProfile, changeUserPassword, type UserProfile, type UpdateProfileData, type ChangePasswordData } from "@/services/api";

export const ProfileSection = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: ""
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [errors, setErrors] = useState<any>({});

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const userData = await getUserProfile();
        setOriginalProfile(userData);
        
        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : ""
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [toast]);

  const validateProfile = () => {
    const newErrors: any = {};
    
    if (!profile.name.trim()) newErrors.name = "Name is required";
    if (!profile.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = "Email is invalid";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswords = () => {
    const newErrors: any = {};
    
    if (!passwords.current) newErrors.current = "Current password is required";
    if (!passwords.new) newErrors.new = "New password is required";
    else if (passwords.new.length < 6) newErrors.new = "Password must be at least 6 characters";
    if (!passwords.confirm) newErrors.confirm = "Confirm password is required";
    else if (passwords.new !== passwords.confirm) newErrors.confirm = "Passwords do not match";
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfile()) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined,
        dateOfBirth: profile.dateOfBirth || undefined,
      };

      const response = await updateUserProfile(updateData);
      setOriginalProfile(response.user);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!validatePasswords()) return;
    
    setIsPasswordLoading(true);
    try {
      const passwordData: ChangePasswordData = {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      };

      await changeUserPassword(passwordData);
      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile({
        name: originalProfile.name || "",
        email: originalProfile.email || "",
        phone: originalProfile.phone || "",
        dateOfBirth: originalProfile.dateOfBirth ? new Date(originalProfile.dateOfBirth).toISOString().split('T')[0] : ""
      });
    }
    setErrors({});
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {originalProfile && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Member since: {new Date(originalProfile.memberSince).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                className={errors.phone ? "border-destructive" : ""}
                placeholder="Optional"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                className={errors.dateOfBirth ? "border-destructive" : ""}
              />
              {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleProfileSave} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                className={errors.current ? "border-destructive" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.current && <p className="text-sm text-destructive">{errors.current}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                  className={errors.new ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.new && <p className="text-sm text-destructive">{errors.new}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                  className={errors.confirm ? "border-destructive" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirm && <p className="text-sm text-destructive">{errors.confirm}</p>}
            </div>
          </div>
          
          <Button onClick={handlePasswordChange} disabled={isPasswordLoading}>
            {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};