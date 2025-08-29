// app/(protected)/account/personal-info/page.tsx
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PersonalInfoPage() {
  const { user } = useAuthStore();
  const { darkMode } = useThemeStore();

  const personalInfoFields = [
    { label: 'Full Name', value: user?.name, icon: 'person' },
    { label: 'Email', value: user?.email, icon: 'email' },
    { label: 'Phone', value: user?.phone || 'Not provided', icon: 'phone' },
    { label: 'Member Since', value: new Date(user?.createdAt || '').toLocaleDateString(), icon: 'calendar-today' },
  ];

  return (
   
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        				<Pressable onPress={() => router.push({ pathname: '/(tabs)/(protected)/profile' })} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
					<MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
				</Pressable>
<View style={{marginTop: 60}}>
{personalInfoFields.map((field, index) => (
          
          <View 
            key={index}
            style={[
              styles.infoCard, 
              darkMode && styles.darkInfoCard,
              index === personalInfoFields.length - 1 && { borderBottomWidth: 0 }
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name={field.icon as any} 
                size={24} 
                color={darkMode ? '#94a3b8' : '#64748b'} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.label, darkMode && styles.darkLabel]}>
                {field.label}
              </Text>
              <Text style={[styles.value, darkMode && styles.darkValue]}>
                {field.value}
              </Text>
            </View>
          </View>
        ))}
</View>
      </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  darkContainer: {
    backgroundColor: '#0f172a',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  darkInfoCard: {
    borderBottomColor: '#1e293b',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  darkLabel: {
    color: '#94a3b8',
  },
  value: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  darkValue: {
    color: '#f8fafc',
  },
});