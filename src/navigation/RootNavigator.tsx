import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { 
  TodayScreen, 
  TherapyScreen, 
  PhysicalScreen, 
  StatsScreen, 
  SocialScreen,
  HabitDetailScreen,
  SettingsScreen,
  HabitManagerScreen,
  AgoraphobiaHomeScreen,
  FearProfileOnboardingScreen,
  ExposureLadderScreen,
  ActiveSessionScreen,
  SessionReviewScreen,
  ThoughtRecordScreen,
  AgoraphobiaStatsScreen,
  CustomGoalSetupScreen,
  CustomGoalReviewScreen,
  TechniquesHomeScreen,
  CalmSessionScreen,
  GroundingScreen,
} from '../screens';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TodayStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TodayRoot" component={TodayScreen} />
    <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
  </Stack.Navigator>
);

const TherapyStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AgoraphobiaHome" component={AgoraphobiaHomeScreen} />
    <Stack.Screen name="TherapyRoot" component={TherapyScreen} />
    <Stack.Screen name="FearProfileOnboarding" component={FearProfileOnboardingScreen} />
    <Stack.Screen name="ExposureLadder" component={ExposureLadderScreen} />
    <Stack.Screen name="ActiveSession" component={ActiveSessionScreen} />
    <Stack.Screen name="SessionReview" component={SessionReviewScreen} />
    <Stack.Screen name="ThoughtRecord" component={ThoughtRecordScreen} />
    <Stack.Screen name="AgoraphobiaStats" component={AgoraphobiaStatsScreen} />
    <Stack.Screen name="CustomGoalSetup" component={CustomGoalSetupScreen} />
    <Stack.Screen name="CustomGoalReview" component={CustomGoalReviewScreen} />
  </Stack.Navigator>
);

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsRoot" component={SettingsScreen} />
    <Stack.Screen name="HabitManager" component={HabitManagerScreen} />
    <Stack.Screen name="HabitDetail" component={HabitDetailScreen} />
  </Stack.Navigator>
);

const TechniquesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TechniquesHome" component={TechniquesHomeScreen} />
    <Stack.Screen name="CalmSession" component={CalmSessionScreen} />
    <Stack.Screen name="GroundingSession" component={GroundingScreen} />
  </Stack.Navigator>
);

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Today" component={TodayStack} />
        <Tab.Screen name="Therapy" component={TherapyStack} />
        <Tab.Screen name="Techniques" component={TechniquesStack} />
        <Tab.Screen name="Stats" component={StatsScreen} />
        <Tab.Screen name="Settings" component={SettingsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
