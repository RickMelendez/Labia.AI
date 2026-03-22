import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import { container } from '../../infrastructure/di/Container';
import { useAppStore } from '../../store/appStore';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';

type Props = NativeStackScreenProps<any, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const { setUser, setToken } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      container.toast.error('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      container.toast.error('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      container.toast.error('Error', 'Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      container.toast.error('Error', 'Password must have at least 1 uppercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      container.toast.error('Error', 'Password must have at least 1 number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await container.authApi.register({ email, password, name, country: 'US' });
      await setToken(response.token);
      setUser(response.user);
      container.toast.success('Account created!', `Welcome ${name}`);
    } catch (error: any) {
      console.error('Signup error:', error);
      const detail = error.detail;
      const message = Array.isArray(detail)
        ? detail.map((e: any) => e.msg).join(', ')
        : typeof detail === 'string'
        ? detail
        : 'Could not create account';
      container.toast.error('Sign up failed', message);
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
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>L</Text>
            </View>
            <Text style={styles.brandName}>Create Account</Text>
            <Text style={styles.subtitle}>Join Labia.AI</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              icon="account-outline"
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
            <InputField
              icon="email-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            <InputField
              icon="lock-outline"
              placeholder="Password (8+ chars, uppercase, number)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.text.muted}
                  />
                </TouchableOpacity>
              }
            />
            <InputField
              icon="lock-check-outline"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              editable={!isLoading}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.text.muted}
                  />
                </TouchableOpacity>
              }
            />

            <Text style={styles.terms}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            <NeonButton
              onPress={handleSignup}
              disabled={isLoading}
              loading={isLoading}
              label="Create Account"
              leftIcon={<MaterialCommunityIcons name="account-plus" size={18} color={COLORS.text.onBrand} />}
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

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, editable, rightIcon,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  editable?: boolean;
  rightIcon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[inputStyles.container, focused && inputStyles.containerFocused]}>
      <MaterialCommunityIcons name={icon} size={20} color={focused ? COLORS.primary : COLORS.text.muted} />
      <TextInput
        style={inputStyles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.muted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {rightIcon}
    </View>
  );
}

const inputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDE8',
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 10,
  },
  containerFocused: {
    borderColor: COLORS.primary,
  },
  input: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(249,112,96,0.30)',
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
    paddingBottom: 40,
  },
  terms: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
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
    marginBottom: 28,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F0EDE8',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
