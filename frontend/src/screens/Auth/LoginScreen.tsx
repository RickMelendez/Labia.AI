import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import { container } from '../../infrastructure/di/Container';
import { useAppStore } from '../../store/appStore';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';

type Props = NativeStackScreenProps<any, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { setUser, setToken } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      container.toast.error('Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await container.authApi.login({ email, password });
      await setToken(response.token);
      setUser(response.user);
      container.toast.success('Welcome back!', `Hi ${response.user.name || 'again'}`);
    } catch (error: any) {
      console.error('Login error:', error);
      container.toast.error('Sign in failed', error.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Logo + Brand */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>L</Text>
          </View>
          <Text style={styles.brandName}>Labia.AI</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={emailFocused ? COLORS.primary : COLORS.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.text.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={passwordFocused ? COLORS.primary : COLORS.text.muted} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <NeonButton
            onPress={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            label="Sign In"
            leftIcon={<MaterialCommunityIcons name="login" size={18} color={COLORS.text.onBrand} />}
            style={{ marginBottom: 24 }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons name="google" size={22} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialCommunityIcons name="apple" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A08',
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 36,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(245,158,11,0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoLetter: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text.onBrand,
  },
  brandName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161210',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 10,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
  },
  input: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dividerText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 13,
    color: COLORS.text.muted,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#161210',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  signupLink: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
