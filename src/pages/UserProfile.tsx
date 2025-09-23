import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingSection } from "@/components/profile/BookingSection";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { SettingsSection } from "@/components/profile/SettingsSection";
import MyRewards from "./MyRewards";
import MyReviews from "./MyReviews";
import { User, BookOpen, Settings, Gift, Star } from "lucide-react";

const UserProfile = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile, bookings, and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileSection />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <BookingSection />
          </TabsContent>

          <TabsContent value="rewards" className="mt-6">
            <MyRewards />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <MyReviews />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;