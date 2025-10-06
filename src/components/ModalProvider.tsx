import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts';
import * as Haptics from 'expo-haptics';

/**
 * Base modal configuration
 */
interface BaseModalConfig {
  title: string;
  message?: string;
  onClose?: () => void;
}

/**
 * Confirmation modal configuration
 */
interface ConfirmationModalConfig extends BaseModalConfig {
  type: 'confirmation';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmColor?: string;
  cancelColor?: string;
}

/**
 * Alert modal configuration
 */
interface AlertModalConfig extends BaseModalConfig {
  type: 'alert';
  buttonText?: string;
  buttonColor?: string;
}

/**
 * Loading modal configuration
 */
interface LoadingModalConfig extends Omit<BaseModalConfig, 'onClose'> {
  type: 'loading';
}

/**
 * Form modal configuration
 */
interface FormModalConfig extends BaseModalConfig {
  type: 'form';
  placeholder?: string;
  initialValue?: string;
  confirmText?: string;
  cancelText?: string;
  onSubmit: (value: string) => void;
  onCancel?: () => void;
}

/**
 * Union type for all modal configurations
 */
type ModalConfig =
  | ConfirmationModalConfig
  | AlertModalConfig
  | LoadingModalConfig
  | FormModalConfig;

/**
 * Modal context interface
 */
interface ModalContextValue {
  showConfirmation: (config: Omit<ConfirmationModalConfig, 'type'>) => void;
  showAlert: (config: Omit<AlertModalConfig, 'type'>) => void;
  showLoading: (config: Omit<LoadingModalConfig, 'type'>) => void;
  showForm: (config: Omit<FormModalConfig, 'type'>) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

/**
 * Modal Provider Component
 *
 * Provides a centralized modal system for the app with elder-friendly design.
 * Supports confirmation, alert, loading, and form modals with accessibility features.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [modalStack, setModalStack] = useState<ModalConfig[]>([]);
  const [formValue, setFormValue] = useState('');

  const currentModal = modalStack[modalStack.length - 1];

  const hideModal = useCallback(() => {
    setModalStack((prev) => prev.slice(0, -1));
    setFormValue('');
  }, []);

  const showConfirmation = useCallback(
    (config: Omit<ConfirmationModalConfig, 'type'>) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setModalStack((prev) => [...prev, { ...config, type: 'confirmation' }]);
    },
    []
  );

  const showAlert = useCallback((config: Omit<AlertModalConfig, 'type'>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalStack((prev) => [...prev, { ...config, type: 'alert' }]);
  }, []);

  const showLoading = useCallback(
    (config: Omit<LoadingModalConfig, 'type'>) => {
      setModalStack((prev) => [...prev, { ...config, type: 'loading' }]);
    },
    []
  );

  const showForm = useCallback((config: Omit<FormModalConfig, 'type'>) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFormValue(config.initialValue || '');
    setModalStack((prev) => [...prev, { ...config, type: 'form' }]);
  }, []);

  const handleConfirm = () => {
    if (currentModal?.type === 'confirmation') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      currentModal.onConfirm();
      hideModal();
    } else if (currentModal?.type === 'form') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      currentModal.onSubmit(formValue);
      hideModal();
    }
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentModal?.type === 'confirmation') {
      currentModal.onCancel?.();
    } else if (currentModal?.type === 'form') {
      currentModal.onCancel?.();
    }
    hideModal();
  };

  const handleAlertClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentModal?.type === 'alert') {
      currentModal.onClose?.();
    }
    hideModal();
  };

  const handleBackdropPress = () => {
    if (currentModal?.type !== 'loading') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      currentModal?.onClose?.();
      hideModal();
    }
  };

  return (
    <ModalContext.Provider
      value={{
        showConfirmation,
        showAlert,
        showLoading,
        showForm,
        hideModal,
      }}
    >
      {children}

      <Modal
        visible={!!currentModal}
        transparent
        animationType="fade"
        onRequestClose={handleBackdropPress}
        accessible
        accessibilityViewIsModal
      >
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          accessible={false}
        >
          <Pressable
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.colors.SURFACE,
                ...theme.shadows.LG,
              },
            ]}
            onPress={(e) => {e.stopPropagation();}}
          >
            {/* Confirmation Modal */}
            {currentModal?.type === 'confirmation' && (
              <View style={styles.content}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
                    },
                  ]}
                  accessibilityRole="header"
                >
                  {currentModal.title}
                </Text>

                {currentModal.message && (
                  <Text
                    style={[
                      styles.message,
                      {
                        color: theme.colors.TEXT_SECONDARY,
                        fontSize: theme.typography.FONT_SIZES.BODY,
                      },
                    ]}
                  >
                    {currentModal.message}
                  </Text>
                )}

                <View style={styles.buttonRow}>
                  <Pressable
                    onPress={handleCancel}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor:
                          currentModal.cancelColor ?? theme.colors.SURFACE,
                        borderColor: theme.colors.DIVIDER,
                        borderWidth: 2,
                        minHeight: theme.touchTargets.LARGE,
                        ...theme.shadows.SM,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={currentModal.cancelText ?? 'Cancel'}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: theme.colors.TEXT_PRIMARY,
                          fontSize: theme.typography.FONT_SIZES.HEADING,
                        },
                      ]}
                    >
                      {currentModal.cancelText || 'Cancel'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleConfirm}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor:
                          currentModal.confirmColor ?? theme.colors.PRIMARY,
                        minHeight: theme.touchTargets.LARGE,
                        ...theme.shadows.SM,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={currentModal.confirmText ?? 'Confirm'}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: '#FFFFFF',
                          fontSize: theme.typography.FONT_SIZES.HEADING,
                        },
                      ]}
                    >
                      {currentModal.confirmText || 'Confirm'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Alert Modal */}
            {currentModal?.type === 'alert' && (
              <View style={styles.content}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
                    },
                  ]}
                  accessibilityRole="header"
                >
                  {currentModal.title}
                </Text>

                {currentModal.message && (
                  <Text
                    style={[
                      styles.message,
                      {
                        color: theme.colors.TEXT_SECONDARY,
                        fontSize: theme.typography.FONT_SIZES.BODY,
                      },
                    ]}
                  >
                    {currentModal.message}
                  </Text>
                )}

                <Pressable
                  onPress={handleAlertClose}
                  style={({ pressed }) => [
                    styles.singleButton,
                    {
                      backgroundColor:
                        currentModal.buttonColor || theme.colors.PRIMARY,
                      minHeight: theme.touchTargets.LARGE,
                      ...theme.shadows.SM,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={currentModal.buttonText || 'OK'}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: '#FFFFFF',
                        fontSize: theme.typography.FONT_SIZES.HEADING,
                      },
                    ]}
                  >
                    {currentModal.buttonText || 'OK'}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Loading Modal */}
            {currentModal?.type === 'loading' && (
              <View style={styles.content}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.PRIMARY}
                  accessibilityLabel="Loading"
                />
                <Text
                  style={[
                    styles.loadingText,
                    {
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.HEADING,
                    },
                  ]}
                >
                  {currentModal.title}
                </Text>
                {currentModal.message && (
                  <Text
                    style={[
                      styles.message,
                      {
                        color: theme.colors.TEXT_SECONDARY,
                        fontSize: theme.typography.FONT_SIZES.BODY,
                      },
                    ]}
                  >
                    {currentModal.message}
                  </Text>
                )}
              </View>
            )}

            {/* Form Modal */}
            {currentModal?.type === 'form' && (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.content}
              >
                <Text
                  style={[
                    styles.title,
                    {
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.LARGE_HEADING,
                    },
                  ]}
                  accessibilityRole="header"
                >
                  {currentModal.title}
                </Text>

                {currentModal.message && (
                  <Text
                    style={[
                      styles.message,
                      {
                        color: theme.colors.TEXT_SECONDARY,
                        fontSize: theme.typography.FONT_SIZES.BODY,
                      },
                    ]}
                  >
                    {currentModal.message}
                  </Text>
                )}

                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.colors.BACKGROUND,
                      borderColor: theme.colors.DIVIDER,
                      color: theme.colors.TEXT_PRIMARY,
                      fontSize: theme.typography.FONT_SIZES.HEADING,
                      minHeight: theme.touchTargets.LARGE,
                    },
                  ]}
                  value={formValue}
                  onChangeText={setFormValue}
                  placeholder={currentModal.placeholder}
                  placeholderTextColor={theme.colors.TEXT_DISABLED}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleConfirm}
                  accessibilityLabel="Input field"
                />

                <View style={styles.buttonRow}>
                  <Pressable
                    onPress={handleCancel}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor: theme.colors.SURFACE,
                        borderColor: theme.colors.DIVIDER,
                        borderWidth: 2,
                        minHeight: theme.touchTargets.LARGE,
                        ...theme.shadows.SM,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={currentModal.cancelText ?? 'Cancel'}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: theme.colors.TEXT_PRIMARY,
                          fontSize: theme.typography.FONT_SIZES.HEADING,
                        },
                      ]}
                    >
                      {currentModal.cancelText || 'Cancel'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleConfirm}
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor: theme.colors.PRIMARY,
                        minHeight: theme.touchTargets.LARGE,
                        ...theme.shadows.SM,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={currentModal.confirmText || 'Submit'}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: '#FFFFFF',
                          fontSize: theme.typography.FONT_SIZES.HEADING,
                        },
                      ]}
                    >
                      {currentModal.confirmText || 'Submit'}
                    </Text>
                  </Pressable>
                </View>
              </KeyboardAvoidingView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ModalContext.Provider>
  );
}

/**
 * Custom hook to access modal context
 *
 * Elder-friendly: Provides simple API for showing modals
 *
 * @returns Modal context methods
 * @throws Error if used outside ModalProvider
 */
export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  modalContainer: {
    borderRadius: 24,
    padding: 40,
    width: '100%',
    maxWidth: 600,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  loadingText: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 16,
    fontWeight: '500',
    width: '100%',
    marginBottom: 32,
  },
});
