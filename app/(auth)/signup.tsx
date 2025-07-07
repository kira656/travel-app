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
import { useAuthStore } from '../../stores/authStore'; // Import your authStore
import { useThemeStore } from '../../stores/themeStore';

export default function Signup() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useThemeStore();
  // Get the signUp action from your authStore
  const signUpUser = useAuthStore((state) => state.signUp);

  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name as keyof typeof errors] || errors.general) {
      setErrors({
        ...errors,
        [name]: '',
        general: '',
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Call the signUp action from your authStore
      await signUpUser({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // Redirect to the home page after successful signup and state update
      router.replace('/(tabs)/home'); // Adjust this path to your actual home page route

    } catch (error: any) {
      console.error('Signup error:', error);
      // Attempt to get a more specific error message from the API response
      // This assumes your API error structure might be error.response.data.message
      const errorMessage = error?.response?.data?.message || error.message || 'Signup failed. Please try again.';
      setErrors({
        ...errors,
        general: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
        <Text style={[styles.title, darkMode && styles.darkText]}>Create an Account</Text>

        {errors.general && (
          <Text style={styles.errorText}>{errors.general}</Text>
        )}

        <View style={styles.form}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, darkMode && styles.darkText]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                errors.name && styles.inputError,
                darkMode && styles.darkInput
              ]}
              placeholder="John Doe"
              placeholderTextColor={darkMode ? '#a0a0a0' : '#666'}
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Username Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, darkMode && styles.darkText]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                errors.username && styles.inputError,
                darkMode && styles.darkInput
              ]}
              placeholder="johndoe123"
              placeholderTextColor={darkMode ? '#a0a0a0' : '#666'}
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
              autoCapitalize="none"
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, darkMode && styles.darkText]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
                darkMode && styles.darkInput
              ]}
              placeholder="john@example.com"
              placeholderTextColor={darkMode ? '#a0a0a0' : '#666'}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password Field */}
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
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, darkMode && styles.darkText]}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                  darkMode && styles.darkInput
                ]}
                placeholder="••••••"
                placeholderTextColor={darkMode ? '#a0a0a0' : '#666'}
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={darkMode ? '#a0a0a0' : '#666'}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
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
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </Pressable>
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, darkMode && styles.darkSubtext]}>
            Already have an account?
          </Text>
          <Link href="/login" asChild>
            <Pressable>
              <Text style={[styles.loginLink, darkMode && styles.darkLink]}>
                Log in
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  darkSubtext: {
    color: '#a0a0a0',
  },
  loginLink: {
    color: '#467cff',
    fontFamily: 'Poppins-Regular',
  },
  darkLink: {
    color: '#64a0ff',
  },
});