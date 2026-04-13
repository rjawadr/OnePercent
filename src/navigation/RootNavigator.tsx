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
  ThoughtJournalScreen,
  AgoraphobiaStatsScreen,
  CustomGoalSetupScreen,
  CustomGoalReviewScreen,
  TechniquesHomeScreen,
  CalmSessionScreen,
  GroundingScreen,
  FearProfileScreen,
  FearEducationScreen,
} from '../screens';
import { CustomTabBar } from '../components/ui/CustomTabBar';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator();
const TodayStackNav = createNativeStackNavigator();
const TherapyStackNav = createNativeStackNavigator();
const SettingsStackNav = createNativeStackNavigator();
const TechniquesStackNav = createNativeStackNavigator();

const TodayStack = () => (
  <TodayStackNav.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <TodayStackNav.Screen name="TodayRoot" component={TodayScreen} />
    <TodayStackNav.Screen 
      name="HabitDetail" 
      component={HabitDetailScreen} 
      options={{ gestureEnabled: true }}
    />
  </TodayStackNav.Navigator>
);

const TherapyStack = () => (
  <TherapyStackNav.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <TherapyStackNav.Screen name="AgoraphobiaHome" component={AgoraphobiaHomeScreen} />
    <TherapyStackNav.Screen name="TherapyRoot" component={TherapyScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="FearProfileOnboarding" component={FearProfileOnboardingScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="ExposureLadder" component={ExposureLadderScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="ActiveSession" component={ActiveSessionScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="SessionReview" component={SessionReviewScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="ThoughtRecord" component={ThoughtRecordScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="ThoughtJournal" component={ThoughtJournalScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="AgoraphobiaStats" component={AgoraphobiaStatsScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="CustomGoalSetup" component={CustomGoalSetupScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="CustomGoalReview" component={CustomGoalReviewScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="FearProfile" component={FearProfileScreen} options={{ gestureEnabled: true }} />
    <TherapyStackNav.Screen name="FearEducation" component={FearEducationScreen} options={{ gestureEnabled: true }} />
  </TherapyStackNav.Navigator>
);

const SettingsStack = () => (
  <SettingsStackNav.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <SettingsStackNav.Screen name="SettingsRoot" component={SettingsScreen} />
    <SettingsStackNav.Screen name="HabitManager" component={HabitManagerScreen} options={{ gestureEnabled: true }} />
    <SettingsStackNav.Screen name="HabitDetail" component={HabitDetailScreen} options={{ gestureEnabled: true }} />
    <SettingsStackNav.Screen name="FearProfile" component={FearProfileScreen} options={{ gestureEnabled: true }} />
  </SettingsStackNav.Navigator>
);

const TechniquesStack = () => (
  <TechniquesStackNav.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
    <TechniquesStackNav.Screen name="TechniquesHome" component={TechniquesHomeScreen} />
    <TechniquesStackNav.Screen name="CalmSession" component={CalmSessionScreen} options={{ gestureEnabled: true }} />
    <TechniquesStackNav.Screen name="GroundingSession" component={GroundingScreen} options={{ gestureEnabled: true }} />
  </TechniquesStackNav.Navigator>
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
