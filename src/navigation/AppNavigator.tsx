import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
import FormMateriScreen from '../screens/admin/FormMateriScreen';
import ManageLevelScreen from '../screens/admin/ManageLevelScreen';
import FormLevelScreen from '../screens/admin/FormLevelScreen';
import UEQAnalitikScreen from '../screens/admin/UEQAnalitikScreen';
import DataSiswaScreen from '../screens/admin/DataSiswaScreen';
import DetailKuesionerSiswaScreen from '../screens/admin/DetailKuesionerSiswaScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab definitions
const USER_TABS = [
  { name: 'Beranda',   icon: 'home',            iconFocused: 'home',            component: HomeScreen },
  { name: 'Materi',    icon: 'book-outline',     iconFocused: 'book',            component: MateriScreen },
  { name: 'Kuesioner', icon: 'clipboard-outline', iconFocused: 'clipboard',      component: UEQFormScreen },
  { name: 'Simulasi',  icon: 'game-controller-outline', iconFocused: 'game-controller', component: SimulasiScreen },
  { name: 'Profil',    icon: 'person-outline',   iconFocused: 'person',          component: ProfileScreen },
];

// Custom Tab Bar — fully controls overflow so the floating Kuesioner button isn't clipped
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={navStyles.wrapper}>
      {/* The bar itself */}
      <View style={navStyles.bar}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const tab = USER_TABS[index];
          const isCenter = index === 2; // Kuesioner

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (isCenter) {
            // Floating center button — rendered ABOVE the bar
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.8}
                style={navStyles.centerWrapper}
              >
                <View style={navStyles.centerBtn}>
                  <Ionicons name="clipboard-outline" size={26} color="#fff" />
                </View>
                <Text style={navStyles.centerLabel}>Kuesioner</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={navStyles.tabItem}
            >
              <Ionicons
                name={(focused ? tab.iconFocused : tab.icon) as any}
                size={24}
                color={focused ? '#a53b22' : '#737972'}
              />
              <Text style={[navStyles.tabLabel, focused && navStyles.tabLabelFocused]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const navStyles = StyleSheet.create({
  // Outer wrapper so the floating button can overflow above the bar
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Extra top padding gives room for the floating button
    paddingTop: 28,
    backgroundColor: 'transparent',
  },
  // The visible navigation bar
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 72,
    backgroundColor: 'rgba(252, 249, 238, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#c2c8c0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 14,
    paddingHorizontal: 8,
  },
  // Regular tab item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
    color: '#737972',
  },
  tabLabelFocused: {
    color: '#a53b22',
    fontWeight: '700',
  },
  // Center Kuesioner button — sits above the bar
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    // Push the button upward above the bar (mirror of HTML -top-6 = -24px)
    marginTop: -46,
    paddingBottom: 4,
  },
  centerBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2d5af7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2d5af7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  centerLabel: {
    fontSize: 10,
    marginTop: 5,
    fontWeight: '700',
    color: '#737972',
    textAlign: 'center',
  },
});

function UserTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {USER_TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
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
          <Stack.Screen name="FormMateri" component={FormMateriScreen} />
          <Stack.Screen name="ManageSoal" component={ManageSoalScreen} />
          <Stack.Screen name="FormSoal" component={FormSoalScreen} />
          <Stack.Screen name="ManageLevel" component={ManageLevelScreen} />
          <Stack.Screen name="FormLevel" component={FormLevelScreen} />
          <Stack.Screen name="UEQAnalitik" component={UEQAnalitikScreen} />
          <Stack.Screen name="DataSiswa" component={DataSiswaScreen} />
          <Stack.Screen name="DetailKuesionerSiswa" component={DetailKuesionerSiswaScreen} />
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
