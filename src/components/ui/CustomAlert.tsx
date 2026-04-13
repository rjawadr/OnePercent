import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { useUIStore } from '../../store/uiStore';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import { Button } from './Button';

const { width } = Dimensions.get('window');

export const CustomAlert = () => {
  const { alertConfig, hideAlert } = useUIStore();

  if (!alertConfig) return null;

  const { title, message, buttons, type = 'info' } = alertConfig;
  const isVertical = buttons && buttons.length > 2;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle', color: Colors.brand };
      case 'warning':
        return { name: 'alert-triangle', color: Colors.amber };
      case 'error':
        return { name: 'alert-octagon', color: Colors.error || Colors.amber };
      default:
        return { name: 'info', color: Colors.brand };
    }
  };

  const iconInfo = getIcon();

  return (
    <Modal
      transparent
      visible={!!alertConfig}
      animationType="none"
      onRequestClose={hideAlert}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={StyleSheet.absoluteFill}
          >
            <Pressable style={styles.backdrop} onPress={hideAlert} />
          </Animated.View>

          <Animated.View
            entering={ZoomIn.duration(300).springify()}
            exiting={ZoomOut.duration(200)}
            style={styles.alertCard}
          >
            <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '15' }]}>
              <Icon name={iconInfo.name} size={32} color={iconInfo.color} />
            </View>

            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}

            <View style={[styles.buttonContainer, isVertical && styles.buttonContainerVertical]}>
              {buttons && buttons.length > 0 ? (
                buttons.map((btn, index) => (
                  <Button
                    key={index}
                    title={btn.text}
                    type={btn.style === 'cancel' ? 'ghost' : (index === buttons.map(b => b.style).lastIndexOf('default') || index === buttons.length - 1) ? 'primary' : 'secondary'}
                    onPress={() => {
                      btn.onPress?.();
                      hideAlert();
                    }}
                    style={[
                      styles.button,
                      isVertical && styles.verticalButton
                    ]}
                  />
                ))
              ) : (
                <Button title="OK" onPress={hideAlert} style={styles.button} />
              )}
            </View>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 43, 74, 0.4)', // Colors.overlay if available
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  alertCard: {
    width: width * 0.85,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.elevated,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.l,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.m,
  },
  buttonContainerVertical: {
    flexDirection: 'column',
    gap: Spacing.s,
  },
  button: {
    flex: 1,
  },
  verticalButton: {
    width: '100%',
    flex: 0,
  },
});
