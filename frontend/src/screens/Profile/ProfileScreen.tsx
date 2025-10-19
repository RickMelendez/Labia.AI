import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CULTURAL_STYLES, TONES } from '../../constants';
import { useAppStore } from '../../store/appStore';

export default function ProfileScreen() {
  const { culturalStyle, setCulturalStyle, defaultTone, setDefaultTone, logout } = useAppStore();

  const currentCulture = CULTURAL_STYLES.find((s) => s.value === culturalStyle);
  const currentToneInfo = TONES.find((t) => t.value === defaultTone);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>👤</Text>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plan Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Actual</Text>
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Free</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Gratis</Text>
              </View>
            </View>
            <Text style={styles.planDescription}>10 sugerencias por día</Text>

            <TouchableOpacity style={styles.upgradeButton}>
              <Ionicons name="rocket-outline" size={20} color={COLORS.primary} />
              <Text style={styles.upgradeText}>Mejorar a Pro</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias</Text>

          <SettingItem
            icon="flag"
            label="Estilo Cultural"
            value={`${currentCulture?.flag} ${currentCulture?.label}`}
            onPress={() => Alert.alert('Cambiar Estilo', 'Funcionalidad próximamente')}
          />

          <SettingItem
            icon="color-palette"
            label="Tono Predeterminado"
            value={`${currentToneInfo?.icon} ${currentToneInfo?.label}`}
            onPress={() => Alert.alert('Cambiar Tono', 'Funcionalidad próximamente')}
          />
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <SettingItem
            icon="information-circle"
            label="Acerca de Labia.AI"
            onPress={() => Alert.alert('Labia.AI', 'Versión 1.0.0 (Beta)\n\nTu asistente de conversación con sabor latino')}
          />

          <SettingItem
            icon="shield-checkmark"
            label="Privacidad y Seguridad"
            onPress={() => Alert.alert('Privacidad', 'Tus conversaciones no se almacenan permanentemente')}
          />

          <SettingItem
            icon="help-circle"
            label="Ayuda y Soporte"
            onPress={() => Alert.alert('Ayuda', 'Contacto: support@labia.ai')}
          />
        </View>

        {/* Coming Soon Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximamente</Text>

          <SettingItem
            icon="stats-chart"
            label="Estadísticas de Uso"
            value="🚧"
            disabled
          />

          <SettingItem
            icon="chatbubbles"
            label="Historial de Conversaciones"
            value="🚧"
            disabled
          />

          <SettingItem
            icon="trophy"
            label="Logros y Progreso"
            value="🚧"
            disabled
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Reiniciar App</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 1.0.0 (Beta)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
}

function SettingItem({ icon, label, value, onPress, disabled }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color={disabled ? COLORS.text.disabled : COLORS.text.primary} />
        <Text style={[styles.settingLabel, disabled && styles.settingLabelDisabled]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && !disabled && (
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.secondary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center'
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary
  },
  content: {
    flex: 1,
    paddingHorizontal: 24
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12
  },
  planCard: {
    backgroundColor: COLORS.surface.light,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary
  },
  planBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 16
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF1F7',
    borderRadius: 12,
    gap: 8
  },
  upgradeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface.light,
    borderRadius: 12,
    marginBottom: 8
  },
  settingItemDisabled: {
    opacity: 0.5
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginLeft: 12,
    flex: 1
  },
  settingLabelDisabled: {
    color: COLORS.text.disabled
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.text.secondary
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
    gap: 8
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error
  },
  version: {
    fontSize: 12,
    color: COLORS.text.disabled,
    textAlign: 'center',
    marginBottom: 40
  }
});
