import { useAuth } from '@/stores/authStore.ts';
import { useTheme } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    usernameOrEmail: '',
    password: '',
    general: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { usernameOrEmail: '', password: '', general: '' };

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await login({
        emailOrUsername: formData.usernameOrEmail,
        password: formData.password,
      });
      router.replace('/(protected)');
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, general: err.message || 'Login failed' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, darkMode && styles.darkContainer]}
    >
      {/* Header with Back Button and Theme Toggle */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons 
            name="arrow-back" 
            size={24} 
            color={darkMode ? '#fff' : '#1e293b'} 
          />
        </Pressable>
        
        <Pressable onPress={toggleDarkMode} style={styles.themeToggle}>
          <MaterialIcons 
            name={darkMode ? 'dark-mode' : 'light-mode'} 
            size={24} 
            color={darkMode ? '#fff' : '#1e293b'} 
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, darkMode && styles.darkText]}>Welcome Back</Text>

        {errors.general && (
          <Text style={styles.errorText}>{errors.general}</Text>
        )}

        <View style={styles.form}>
          {/* Username or Email */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, darkMode && styles.darkText]}>Username or Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.usernameOrEmail && styles.inputError,
                darkMode && styles.darkInput
              ]}
              placeholder="johndoe123 or john@example.com"
              placeholderTextColor={darkMode ? '#a0a0a0' : '#666'}
              value={formData.usernameOrEmail}
              onChangeText={(text) => handleChange('usernameOrEmail', text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.usernameOrEmail && (
              <Text style={styles.errorText}>{errors.usernameOrEmail}</Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, darkMode && styles.darkText]}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input, 
                  errors.password && styles.inputError,
                  darkMode && styles.darkInput
                ]}
                placeholder="••••••"
                placeholderTextColor={darkMode ? '#a0a0a0' : '#666'}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={darkMode ? '#a0a0a0' : '#666'}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <Pressable>
              <Text style={[styles.forgotPasswordText, darkMode && styles.darkLink]}>
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </Pressable>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, darkMode && styles.darkSubtext]}>
            Don't have an account?
          </Text>
          <Link href="/signup" asChild>
            <Pressable>
              <Text style={[styles.signupLink, darkMode && styles.darkLink]}>
                Sign Up
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    padding: 10,
    zIndex: 2,
  },
  themeToggle: {
    padding: 10,
    zIndex: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins-Regular',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1e293b',
  },
  darkText: {
    color: '#ffffff',
  },
  form: {
    gap: 14,
    marginBottom: 20,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  darkInput: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
    color: '#fff',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#467cff',
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  signupText: {
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  darkSubtext: {
    color: '#a0a0a0',
  },
  signupLink: {
    color: '#467cff',
    fontFamily: 'Poppins-Regular',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#467cff',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  darkLink: {
    color: '#64a0ff',
  },
});