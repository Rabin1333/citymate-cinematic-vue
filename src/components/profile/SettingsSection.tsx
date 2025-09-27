import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Sparkles, Volume } from "lucide-react";
import { useCinematicEffects } from "../../contexts/CinematicEffectsContext";

// Mock API functions
const updateSettings = async (settings: any) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
};

const deleteAccount = async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true };
};

export const SettingsSection = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    cinematicEffectsEnabled,
    setCinematicEffectsEnabled,
    microAudioMuted,
    setMicroAudioMuted
  } = useCinematicEffects();
  
  const [settings, setSettings] = useState({
    notifications: {
      bookingConfirmations: true,
      promotions: true,
      newReleases: false,
      reminders: true,
    },
    privacy: {
      profileVisibility: "private",
      shareBookingHistory: false,
      allowRecommendations: true,
    },
    preferences: {
      language: "en",
      region: "US",
      theme: "dark",
      currency: "USD",
    }
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await updateSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      // In a real app, redirect to home or login page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const updateNotificationSetting = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePrivacySetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const updatePreferenceSetting = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Booking Confirmations</Label>
              <p className="text-sm text-muted-foreground">
                Receive email confirmations for your bookings
              </p>
            </div>
            <Switch
              checked={settings.notifications.bookingConfirmations}
              onCheckedChange={(checked) => updateNotificationSetting('bookingConfirmations', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Promotional Offers</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about special offers and discounts
              </p>
            </div>
            <Switch
              checked={settings.notifications.promotions}
              onCheckedChange={(checked) => updateNotificationSetting('promotions', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Movie Releases</Label>
              <p className="text-sm text-muted-foreground">
                Be the first to know about new movies
              </p>
            </div>
            <Switch
              checked={settings.notifications.newReleases}
              onCheckedChange={(checked) => updateNotificationSetting('newReleases', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Booking Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about your upcoming shows
              </p>
            </div>
            <Switch
              checked={settings.notifications.reminders}
              onCheckedChange={(checked) => updateNotificationSetting('reminders', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cinematic Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cinema-red" />
            Cinematic Effects
          </CardTitle>
          <CardDescription>
            Control immersive movie-themed effects and audio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Cinematic Effects</Label>
              <p className="text-sm text-muted-foreground">
                Enable themed visual effects when interacting with movies
              </p>
            </div>
            <Switch
              checked={cinematicEffectsEnabled}
              onCheckedChange={setCinematicEffectsEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Volume className="h-4 w-4" />
                Mute Micro-Audio
              </Label>
              <p className="text-sm text-muted-foreground">
                Disable sound effects while keeping visual effects
              </p>
            </div>
            <Switch
              checked={microAudioMuted}
              onCheckedChange={setMicroAudioMuted}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Control who can see your profile information
              </p>
            </div>
            <Select
              value={settings.privacy.profileVisibility}
              onValueChange={(value) => updatePrivacySetting('profileVisibility', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Share Booking History</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your movie watching history
              </p>
            </div>
            <Switch
              checked={settings.privacy.shareBookingHistory}
              onCheckedChange={(checked) => updatePrivacySetting('shareBookingHistory', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Personalized Recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Use your viewing history to suggest movies
              </p>
            </div>
            <Switch
              checked={settings.privacy.allowRecommendations}
              onCheckedChange={(checked) => updatePrivacySetting('allowRecommendations', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle>Language & Region</CardTitle>
          <CardDescription>
            Set your preferred language and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={settings.preferences.language}
                onValueChange={(value) => updatePreferenceSetting('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Region</Label>
              <Select
                value={settings.preferences.region}
                onValueChange={(value) => updatePreferenceSetting('region', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={settings.preferences.theme}
                onValueChange={(value) => updatePreferenceSetting('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select
                value={settings.preferences.currency}
                onValueChange={(value) => updatePreferenceSetting('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Settings
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you absolutely sure you want to delete your account? This action cannot be undone. 
                  This will permanently delete your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};