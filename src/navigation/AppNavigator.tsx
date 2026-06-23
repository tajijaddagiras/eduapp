import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// User Screens
import HomeScreen from '../screens/user/HomeScreen';
import MateriScreen from '../screens/user/MateriScreen';
import DetailMateriScreen from '../screens/user/DetailMateriScreen';
import SimulasiScreen from '../screens/user/SimulasiScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import DragAndDropScreen from '../screens/user/DragAndDropScreen';
import HasilEvaluasiScreen from '../screens/user/HasilEvaluasiScreen';
import PembahasanScreen from '../screens/user/PembahasanScreen';
import UEQFormScreen from '../screens/user/UEQFormScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageMateriScreen from '../screens/admin/ManageMateriScreen';
import ManageSoalScreen from '../screens/admin/ManageSoalScreen';
import UEQAnalitikScreen from '../screens/admin/UEQAnalitikScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25, 
          left: 15,
          right: 15,
          elevation: 10,
          backgroundColor: '#fff',
          borderRadius: 35, 
          height: 75,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          borderWidth: 0,
        },
      }}
    >
      <Tab.Screen
        name="Beranda"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? '#1d4ed8' : '#9ca3af'} />
              <Text numberOfLines={1} style={{ color: focused ? '#1d4ed8' : '#9ca3af', fontSize: 9, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>
                Beranda
              </Text>
              {focused && <View style={{ height: 2, width: 30, backgroundColor: '#1d4ed8', marginTop: 3 }} />}
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Materi"
        component={MateriScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? "book" : "book-outline"} size={24} color={focused ? '#1d4ed8' : '#9ca3af'} />
              <Text numberOfLines={1} style={{ color: focused ? '#1d4ed8' : '#9ca3af', fontSize: 9, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>
                Materi
              </Text>
              {focused && <View style={{ height: 2, width: 35, backgroundColor: '#1d4ed8', marginTop: 3 }} />}
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Kuesioner"
        component={UEQFormScreen}
        options={{
          tabBarButton: (props) => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', top: -30 }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={props.onPress}
                style={{
                  width: 60, height: 60, borderRadius: 30, backgroundColor: '#1d4ed8',
                  justifyContent: 'center', alignItems: 'center',
                  shadowColor: '#1d4ed8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8
                }}
              >
                {/* Desain persis Figma (gamepad), tapi untuk fungsi Kuesioner */}
                <Ionicons name="game-controller" size={30} color="#fff" />
              </TouchableOpacity>
              <Text numberOfLines={1} style={{ color: '#1d4ed8', fontSize: 10, marginTop: 8, fontWeight: 'bold' }}>
                Kuesioner
              </Text>
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Simulasi"
        component={SimulasiScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? "cube" : "cube-outline"} size={24} color={focused ? '#1d4ed8' : '#9ca3af'} />
              <Text numberOfLines={1} style={{ color: focused ? '#1d4ed8' : '#9ca3af', fontSize: 9, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>
                Simulasi
              </Text>
              {focused && <View style={{ height: 2, width: 40, backgroundColor: '#1d4ed8', marginTop: 3 }} />}
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? '#1d4ed8' : '#9ca3af'} />
              <Text numberOfLines={1} style={{ color: focused ? '#1d4ed8' : '#9ca3af', fontSize: 9, marginTop: 4, fontWeight: focused ? 'bold' : 'normal' }}>
                Profil
              </Text>
              {focused && <View style={{ height: 2, width: 30, backgroundColor: '#1d4ed8', marginTop: 3 }} />}
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  const { user, userData, isLoading } = useAuth();
  const [isAppLoading, setIsAppLoading] = React.useState(true);
  const [hasBeenAuthenticated, setHasBeenAuthenticated] = React.useState(false);

  React.useEffect(() => {
    if (user) setHasBeenAuthenticated(true);
  }, [user]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isAppLoading || isLoading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Auth Flow
        <>
          {!hasBeenAuthenticated && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : userData?.role === 'admin' ? (
        // Admin Flow
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="ManageMateri" component={ManageMateriScreen} />
          <Stack.Screen name="ManageSoal" component={ManageSoalScreen} />
          <Stack.Screen name="UEQAnalitik" component={UEQAnalitikScreen} />
        </>
      ) : (
        // User Flow
        <>
          <Stack.Screen name="UserTabs" component={UserTabs} />
          <Stack.Screen name="DetailMateri" component={DetailMateriScreen} />
          <Stack.Screen name="DragAndDrop" component={DragAndDropScreen} />
          <Stack.Screen name="HasilEvaluasi" component={HasilEvaluasiScreen} />
          <Stack.Screen name="Pembahasan" component={PembahasanScreen} />
          <Stack.Screen name="UEQForm" component={UEQFormScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
