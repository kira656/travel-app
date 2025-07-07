import { useAuthStore } from "@/stores/authStore";
import { Text, View } from 'react-native';
export default function ProfileScreen() {
  // const { darkMode, toggleDarkMode } = useThemeStore();
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }));



  const handleLogout = async () => {
    await logout();
    // Navigation should be handled by your router/navigator
  };

  return (
    <View> 
<Text>fff</Text>      
         </View>
  );
}