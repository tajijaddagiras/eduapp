import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

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
import EditProfileScreen from '../screens/user/EditProfileScreen';
import RiwayatScreen from '../screens/user/RiwayatScreen';

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
          left: 20,
          right: 20,
          height: 70,
          backgroundColor: '#ffffff',
          borderRadius: 35,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          paddingHorizontal: 10,
        },
      }}
    >
      {/* Tab 1: Beranda */}
      <Tab.Screen
        name="Beranda"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={focused ? '#01190a' : '#9ca3af'} />
              <Text style={{ color: focused ? '#01190a' : '#9ca3af', fontSize: 10, marginTop: 4, fontWeight: focused ? '700' : '600', textAlign: 'center' }}>Beranda</Text>
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
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? 'book' : 'book-outline'} size={24} color={focused ? '#01190a' : '#9ca3af'} />
              <Text style={{ color: focused ? '#01190a' : '#9ca3af', fontSize: 10, marginTop: 4, fontWeight: focused ? '700' : '600', textAlign: 'center' }}>Materi</Text>
            </View>
          ),
        }}
      />

      {/* Tab 3: Kuesioner (Center Button) */}
      <Tab.Screen
        name="Kuesioner"
        component={UEQFormScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: -30 }}>
              <View style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: '#2e7d32',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#2e7d32',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}>
                <Ionicons name="clipboard-outline" size={26} color="#fff" />
              </View>
              <Text style={{ color: '#2e7d32', fontSize: 9, marginTop: 6, fontWeight: '700', textAlign: 'center' }}>Kuesioner</Text>
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
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? 'game-controller' : 'game-controller-outline'} size={24} color={focused ? '#01190a' : '#9ca3af'} />
              <Text style={{ color: focused ? '#01190a' : '#9ca3af', fontSize: 10, marginTop: 4, fontWeight: focused ? '700' : '600', textAlign: 'center' }}>Simulasi</Text>
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
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 60 }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={focused ? '#01190a' : '#9ca3af'} />
              <Text style={{ color: focused ? '#01190a' : '#9ca3af', fontSize: 10, marginTop: 4, fontWeight: focused ? '700' : '600', textAlign: 'center' }}>Profil</Text>
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
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Riwayat" component={RiwayatScreen} />
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
