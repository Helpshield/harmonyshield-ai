import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileTab from '@/components/profile/ProfileTab';
import SecurityTab from '@/components/profile/SecurityTab';
import PreferencesTab from '@/components/profile/PreferencesTab';
import AdvancedTab from '@/components/profile/AdvancedTab';

const ProfilePage = () => {
  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              
              <TabsContent value="security">
                <SecurityTab />
              </TabsContent>
              
              <TabsContent value="preferences">
                <PreferencesTab />
              </TabsContent>
              
              <TabsContent value="advanced">
                <AdvancedTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;