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
import BinaryScreen from '../screens/user/BinaryScreen';
import MultipleChoiceScreen from '../screens/user/MultipleChoiceScreen';
import HasilEvaluasiScreen from '../screens/user/HasilEvaluasiScreen';
import PembahasanScreen from '../screens/user/PembahasanScreen';
import UEQFormScreen from '../screens/user/UEQFormScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ManageMateriScreen from '../screens/admin/ManageMateriScreen';
import ManageSoalScreen from '../screens/admin/ManageSoalScreen';
import FormSoalScreen from '../screens/admin/FormSoalScreen';
import ManageLevelScreen from '../screens/admin/ManageLevelScreen';
import FormLevelScreen from '../screens/admin/FormLevelScreen';
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
          bottom: 20,
          left: 5,
          right: 5,
          height: 70,
          backgroundColor: '#ffffff',
          borderRadius: 40,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          paddingHorizontal: 0,
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}
    >
      {/* Tab 1: Beranda */}
      <Tab.Screen
        name="Beranda"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 54, width: 70, overflow: 'visible' }}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={focused ? '#1d4ed8' : '#9ca3af'}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: focused ? '#1d4ed8' : '#9ca3af',
                  fontSize: 10,
                  marginTop: 3,
                  fontWeight: focused ? '600' : '400',
                  textAlign: 'center',
                  width: 70,
                }}
              >
                Beranda
              </Text>
            </View>
          ),
        }}
      />

      {/* Tab 2: Materi */}
      <Tab.Screen
        name="Materi"
        component={MateriScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 54, width: 70, overflow: 'visible' }}>
              <Ionicons
                name={focused ? 'book' : 'book-outline'}
                size={24}
                color={focused ? '#1d4ed8' : '#9ca3af'}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: focused ? '#1d4ed8' : '#9ca3af',
                  fontSize: 10,
                  marginTop: 3,
                  fontWeight: focused ? '600' : '400',
                  textAlign: 'center',
                  width: 70,
                }}
              >
                Materi
              </Text>
            </View>
          ),
        }}
      />

      {/* Tab 3: Kuesioner (Center Button) */}
      <Tab.Screen
        name="Kuesioner"
        component={UEQFormScreen}
        options={{
          tabBarButton: (props) => (
            <View style={{ flex: 1, alignItems: 'center' }}>
              {/* Floating Circle Button - Posisi lebih rendah */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={props.onPress}
                style={{
                  position: 'absolute',
                  top: -38, // Dari -48 ke -38 (turun 10px)
                  width: 64, // Dari 70 ke 64
                  height: 64, // Dari 70 ke 64
                  borderRadius: 32, // Dari 35 ke 32
                  backgroundColor: '#1d4ed8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#1d4ed8',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons name="clipboard-outline" size={28} color="#ffffff" /> {/* Dari 32 ke 28 */}
              </TouchableOpacity>

              {/* Label at Bottom - Same level as other tabs */}
              <View style={{ 
                position: 'absolute',
                bottom: 0,
                width: 70,
                height: 54,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
                <View style={{ height: 24 }} />
                <Text
                  numberOfLines={1}
                  style={{
                    color: '#1d4ed8',
                    fontSize: 10,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginTop: 3,
                  }}
                >
                  Kuesioner
                </Text>
              </View>
            </View>
          ),
        }}
      />

      {/* Tab 4: Simulasi */}
      <Tab.Screen
        name="Simulasi"
        component={SimulasiScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 54, width: 70, overflow: 'visible' }}>
              <Ionicons
                name={focused ? 'game-controller' : 'game-controller-outline'}
                size={24}
                color={focused ? '#1d4ed8' : '#9ca3af'}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: focused ? '#1d4ed8' : '#9ca3af',
                  fontSize: 10,
                  marginTop: 3,
                  fontWeight: focused ? '600' : '400',
                  textAlign: 'center',
                  width: 70,
                }}
              >
                Simulasi
              </Text>
            </View>
          ),
        }}
      />

      {/* Tab 5: Profil */}
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'flex-end', height: 54, width: 70, overflow: 'visible' }}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={focused ? '#1d4ed8' : '#9ca3af'}
              />
              <Text
                numberOfLines={1}
                style={{
                  color: focused ? '#1d4ed8' : '#9ca3af',
                  fontSize: 10,
                  marginTop: 3,
                  fontWeight: focused ? '600' : '400',
                  textAlign: 'center',
                  width: 70,
                }}
              >
                Profil
              </Text>
            </View>
          ),
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
          <Stack.Screen name="FormSoal" component={FormSoalScreen} />
          <Stack.Screen name="ManageLevel" component={ManageLevelScreen} />
          <Stack.Screen name="FormLevel" component={FormLevelScreen} />
          <Stack.Screen name="UEQAnalitik" component={UEQAnalitikScreen} />
        </>
      ) : (
        // User Flow
        <>
          <Stack.Screen name="UserTabs" component={UserTabs} />
          <Stack.Screen name="DetailMateri" component={DetailMateriScreen} />
          <Stack.Screen name="DragAndDrop" component={DragAndDropScreen} />
          <Stack.Screen name="Binary" component={BinaryScreen} />
          <Stack.Screen name="MultipleChoice" component={MultipleChoiceScreen} />
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
