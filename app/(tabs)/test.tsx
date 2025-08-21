import AppLayout from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { Stack, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';

export function AppNavigator() {
  const { isLoggedIn } = useAuthStore();
  const navigation = useNavigation();

  // Debugging: Log current navigation state
  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      console.log('Current navigation state:', navigation.getState());
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <AppLayout>
      <Stack>
        {/* Public routes */}
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="home" 
          options={{ 
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' } 
          }} 
        />
        
        {/* Protected routes */}
        {isLoggedIn && (
          <>
            <Stack.Screen 
              name="profile" 
              options={{ 
                headerShown: false,
                
                contentStyle: { backgroundColor: 'transparent' } 
              }} 
            />
            <Stack.Screen 
              name="countries" 
              options={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' } 
              }} 
            />
            <Stack.Screen 
              name="favorites" 
              options={{ 
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' } 
              }} 
            />
          </>
        )}
      </Stack>
    </AppLayout>
  );
}