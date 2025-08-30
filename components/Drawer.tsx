import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DrawerItem {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  notifications?: any[];
}

const Drawer: React.FC<DrawerProps> = ({ visible, onClose, notifications = [] }) => {
  const translateX = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const { darkMode } = useThemeStore();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const colors = {
    background: darkMode ? '#1e293b' : '#fff',
    text: darkMode ? '#fff' : '#1e293b',
    border: darkMode ? '#334155' : '#eee',
    icon: darkMode ? '#94a3b8' : '#64748b',
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={styles.flexFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.background,
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="arrow-back-ios" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.items}>
          {notifications.length === 0 ? (
            <View style={{ padding: 20 }}>
              <Text style={{ color: colors.text }}>No notifications</Text>
            </View>
          ) : (
            notifications.map((n: any) => (
              <View key={n.id} style={[styles.notification, { borderBottomColor: colors.border }] }>
                <View style={styles.notificationHeader}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>{n.title}</Text>
                  <Text style={[styles.notificationTime, { color: colors.icon }]}>{new Date(n.createdAt).toLocaleString()}</Text>
                </View>
                <Text style={[styles.notificationBody, { color: colors.text }]} numberOfLines={3}>{n.body}</Text>
              </View>
            ))
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  flexFill: { flex: 1 },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingTop: 20,
    bottom: 0,
    width: 280,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  items: {
    paddingVertical: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notification: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationBody: {
    fontSize: 14,
  },
});

export default Drawer;
