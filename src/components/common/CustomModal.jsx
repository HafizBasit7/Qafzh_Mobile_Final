import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomModal = ({ 
  visible, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  title, 
  message, 
  onClose,
  autoClose = true,
  duration = 3000,
  actionText,
  onAction
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.8));

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto close
      if (autoClose && onClose) {
        const timer = setTimeout(() => {
          onClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getModalConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#10B981',
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
        };
      case 'error':
        return {
          icon: 'error',
          iconColor: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
        };
      case 'info':
        return {
          icon: 'info',
          iconColor: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
      default:
        return {
          icon: 'info',
          iconColor: '#6B7280',
          backgroundColor: '#F9FAFB',
          borderColor: '#E5E7EB',
        };
    }
  };

  const config = getModalConfig();

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer, 
            {
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialIcons 
              name={config.icon} 
              size={48} 
              color={config.iconColor} 
            />
          </View>

          {/* Title */}
          {title && (
            <Text style={styles.title}>{title}</Text>
          )}

          {/* Message */}
          {message && (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {onClose && (
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>إغلاق</Text>
              </TouchableOpacity>
            )}

            {actionText && onAction && (
              <TouchableOpacity
                style={[styles.button, styles.actionButton, { backgroundColor: config.iconColor }]}
                onPress={onAction}
              >
                <Text style={styles.actionButtonText}>{actionText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Tajawal-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Tajawal-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row-reverse',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: '#374151',
  },
  actionButton: {
    // backgroundColor set dynamically
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Tajawal-Medium',
    color: '#FFFFFF',
  },
});

export default CustomModal; 