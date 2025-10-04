import { Pressable, Text, StyleSheet, Alert, TextInput, View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, useAuth } from '@/contexts';
import { useState, useRef } from 'react';

export function ModeSwitch() {
  const { theme } = useTheme();
  const { isAdmin, login, logout } = useAuth();
  const router = useRouter();
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = async () => {
    if (isAdmin) {
      await logout();
      router.replace('/(user)');
    } else {
      setShowPasswordInput(true);
    }
  };

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter the admin password');
      return;
    }

    const success = await login(password);
    
    if (success) {
      setPassword('');
      setIsError(false);
      setShowPasswordInput(false);
      router.replace('/(admin)');
    } else {
      setIsError(true);
      
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPassword('');
        setIsError(false);
      });
    }
  };

  const handleCancel = () => {
    setPassword('');
    setIsError(false);
    setShowPasswordInput(false);
  };

  if (showPasswordInput) {
    return (
      <View style={styles.passwordContainer}>
        <Animated.View
          style={{
            transform: [
              { translateX: shakeAnim },
              { scale: scaleAnim },
            ],
          }}
        >
          <TextInput
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            placeholder="Admin password"
            placeholderTextColor={theme.colors.TEXT_DISABLED}
            returnKeyType="done"
            style={[styles.passwordInput, {
              backgroundColor: theme.colors.SURFACE,
              color: theme.colors.TEXT_PRIMARY,
              fontSize: theme.typography.FONT_SIZES.BODY,
              borderColor: isError ? theme.colors.ERROR : theme.colors.DIVIDER,
              borderWidth: isError ? 2 : 1,
            }]}
            accessibilityLabel="Admin password"
            accessibilityHint="Enter admin password to access admin mode, press return to submit"
          />
        </Animated.View>
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.confirmButton,
            {
              backgroundColor: theme.colors.SUCCESS,
              minHeight: theme.touchTargets.MINIMUM,
              ...theme.shadows.SM,
            },
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Confirm"
        >
          <Text style={[styles.buttonText, {
            color: '#FFFFFF',
            fontSize: theme.typography.FONT_SIZES.BODY,
          }]}>
            ✓
          </Text>
        </Pressable>
        <Pressable
          onPress={handleCancel}
          style={({ pressed }) => [
            styles.cancelButton,
            {
              backgroundColor: theme.colors.ERROR,
              minHeight: theme.touchTargets.MINIMUM,
              ...theme.shadows.SM,
            },
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Text style={[styles.buttonText, {
            color: '#FFFFFF',
            fontSize: theme.typography.FONT_SIZES.BODY,
          }]}>
            ✕
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isAdmin ? theme.colors.ERROR : theme.colors.PRIMARY,
          minHeight: theme.touchTargets.MINIMUM,
          minWidth: theme.touchTargets.MINIMUM,
          ...theme.shadows.MD,
        },
        pressed && styles.buttonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={isAdmin ? 'Switch to User Mode' : 'Switch to Admin Mode'}
      accessibilityHint={isAdmin ? 'Logout from admin mode' : 'Requires admin password'}
    >
      <Text style={[styles.buttonText, {
        color: '#FFFFFF',
        fontSize: theme.typography.FONT_SIZES.BODY,
        fontWeight: '600',
      }]}>
        {isAdmin ? 'User' : 'Admin'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    width: 200,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confirmButton: {
    width: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    width: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
