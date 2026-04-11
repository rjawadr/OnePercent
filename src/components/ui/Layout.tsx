import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Colors } from '../../theme';

const { width, height } = Dimensions.get('window');

interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noTabBar?: boolean;
}

export const Layout = ({ children, style, noTabBar = false }: LayoutProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container, 
      style
    ]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Premium Background Mesh Blobs */}
      <View style={StyleSheet.absoluteFill}>
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient id="grad1" cx="20%" cy="10%" r="40%" fx="20%" fy="10%">
              <Stop offset="0" stopColor={Colors.brand} stopOpacity="0.08" />
              <Stop offset="1" stopColor={Colors.background} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="grad2" cx="80%" cy="40%" r="50%" fx="80%" fy="40%">
              <Stop offset="0" stopColor="#8E44AD" stopOpacity="0.04" />
              <Stop offset="1" stopColor={Colors.background} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="grad3" cx="10%" cy="80%" r="40%" fx="10%" fy="80%">
              <Stop offset="0" stopColor={Colors.amber} stopOpacity="0.06" />
              <Stop offset="1" stopColor={Colors.background} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx="20%" cy="10%" r="40%" fill="url(#grad1)" />
          <Circle cx="80%" cy="40%" r="50%" fill="url(#grad2)" />
          <Circle cx="10%" cy="80%" r="40%" fill="url(#grad3)" />
        </Svg>
      </View>

      <View style={{ 
        flex: 1, 
        paddingTop: insets.top, 
        paddingBottom: noTabBar ? Math.max(insets.bottom, 12) : 64 + Math.max(insets.bottom, 12) 
      }}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
