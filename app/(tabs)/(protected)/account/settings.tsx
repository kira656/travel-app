// app/(protected)/settings/page.tsx
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useThemeStore();

  const settingsOptions = [
    {
      id: 'appearance',
      title: 'Appearance',
      icon: 'brightness-4',
      action: (
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#e2e8f0', true: '#334155' }}
          thumbColor={darkMode ? '#f8fafc' : '#1e293b'}
        />
      ),
    },
    {
      id: 'travel-preferences',
      title: 'Travel Preferences',
      icon: 'airplanemode-active',
      onPress: () => console.log('Navigate to travel preferences'),
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      icon: 'notifications',
      onPress: () => console.log('Navigate to notifications'),
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      icon: 'payment',
      onPress: () => console.log('Navigate to payment methods'),
    },
    {
      id: 'currency',
      title: 'Currency & Language',
      icon: 'language',
      onPress: () => console.log('Navigate to currency settings'),
    },
    {
      id: 'data-saver',
      title: 'Data Saver Mode',
      icon: 'data-saver-off',
      action: <Switch value={false} onValueChange={() => {}} />,
    },
  ];

  return (
   
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        {settingsOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={option.onPress}
            style={[styles.optionCard, darkMode && styles.darkOptionCard]}
          >
            <View style={styles.optionLeft}>
              <MaterialIcons 
                name={option.icon as any} 
                size={24} 
                color={darkMode ? '#94a3b8' : '#64748b'} 
              />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>
                {option.title}
              </Text>
            </View>
            {option.action || (
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={darkMode ? '#94a3b8' : '#64748b'} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
   
  );
}

// Reuse the same styles from previous implementation

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#0f172a',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  darkProfileHeader: {
    backgroundColor: '#1e293b',
  },
  profileText: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  darkText: {
    color: '#f8fafc',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  darkSubtext: {
    color: '#94a3b8',
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  darkOptionCard: {
    backgroundColor: '#1e293b',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1e293b',
  },
});