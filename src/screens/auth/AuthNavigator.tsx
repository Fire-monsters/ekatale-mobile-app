import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParams } from '../../navigation/RootNavigator';

const Stack = createNativeStackNavigator<AuthStackParams>();

const SplashScreen = React.lazy(() => import('../SplashScreen'));
const LanguageScreen = React.lazy(() => import('./LanguageScreen'));
const PhoneEntryScreen = React.lazy(() => import('../PhoneEntryScreen'));
const OTPVerifyScreen = React.lazy(() => import('./OTPVerifyScreen'));
const FarmerRegisterScreen = React.lazy(() => import('../FarmerRegisterScreen'));
const RoleSelectScreen = React.lazy(() => import('./RoleSelectScreen'));

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="FarmerRegister" component={FarmerRegisterScreen} />
    </Stack.Navigator>
  );
}
