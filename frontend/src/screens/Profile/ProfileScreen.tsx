import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CULTURAL_STYLES, TONES } from '../../core/constants';
import { useAppStore } from '../../store/appStore';
import { container } from '../../infrastructure/di/Container';
import CulturalStyleModal from '../../components/common/CulturalStyleModal';
import ToneModal from '../../components/common/ToneModal';
import UsageCard from '../../components/common/UsageCard';
import * as ImagePicker from 'expo-image-picker';
import { ProfileStorage } from '../../infrastructure/storage/ProfileStorage';
import type { DatingProfile } from '../../types';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, culturalStyle, setCulturalStyle, defaultTone, setDefaultTone, isDarkMode, setDarkMode, logout } = useAppStore();
  const [showCultureModal, setShowCultureModal] = useState(false);
  const [showToneModal, setShowToneModal] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [profile, setProfile] = useState<DatingProfile | null>(null);

  // Edit form state
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [education, setEducation] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [bio, setBio] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const existing = await ProfileStorage.get();
      if (existing) {
        setProfile(existing);
        setDisplayName(existing.display_name || '');
        setAge(existing.age ? String(existing.age) : '');
        setGender(existing.gender || '');
        setJobTitle(existing.job_title || '');
        setCompany(existing.company || '');
        setEducation(existing.education || '');
        setHeightCm(existing.height_cm ? String(existing.height_cm) : '');
        setBio(existing.bio || '');
        setInterestsText((existing.interests || []).join(', '));
        setPhotos(existing.photos || []);
      }
    })();
  }, []);

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

  const openImagePicker = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      container.toast.info('Permiso requerido', 'Habilita acceso a fotos para agregar imágenes');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 6 - photos.length,
      quality: 0.8
    });
    if (!result.canceled) {
      const uris = result.assets?.map(a => a.uri) || [];
      setPhotos((prev) => Array.from(new Set([...prev, ...uris])).slice(0, 6));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos(prev => prev.filter(p => p !== uri));
  };

  const saveProfile = async () => {
    if (!displayName.trim()) {
      container.toast.info('Nombre requerido', 'Agrega tu nombre para mostrar');
      return;
    }
    const updated: DatingProfile = {
      display_name: displayName.trim(),
      age: age ? Number(age) : undefined,
      gender: (gender as any) || undefined,
      job_title: jobTitle || undefined,
      company: company || undefined,
      education: education || undefined,
      height_cm: heightCm ? Number(heightCm) : undefined,
      bio: bio || undefined,
      interests: interestsText
        ? interestsText.split(',').map(s => s.trim()).filter(Boolean)
        : undefined,
      photos,
    };
    await ProfileStorage.save(updated);
    setProfile(updated);
    setEditVisible(false);
    container.toast.success('Perfil guardado', 'Tus datos se han actualizado');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
      <AppBackground />
      <View style={styles.header}>
        <MaterialCommunityIcons name="account-heart" size={48} color={COLORS.primary} />
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Mi Perfil</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dating Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Mi Perfil de Citas</Text>
          <View style={[styles.planCard, { backgroundColor: theme.colors.surface }]}> 
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="account" size={20} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { marginLeft: 8, color: theme.colors.onSurface }]}>
                {profile?.display_name || 'Sin nombre'}
              </Text>
            </View>
            {/* Photos preview */}
            <View style={styles.photoGridPreview}>
              {photos.slice(0, 3).map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photoPreview} />
              ))}
              {photos.length === 0 && (
                <View style={[styles.photoEmpty, { borderColor: '#E5E7EB' }]}>
                  <MaterialCommunityIcons name="image-plus" size={24} color={theme.colors.onSurfaceVariant} />
                </View>
              )}
            </View>
            <NeonButton
              label={profile ? 'Editar Perfil' : 'Crear Perfil'}
              onPress={() => setEditVisible(true)}
              leftIcon={<MaterialCommunityIcons name="pencil" size={20} color="#FFF" />}
            />
          </View>
        </View>
        {/* Usage Tracking */}
        {user && (
          <View style={styles.section}>
            <UsageCard
              used={user.daily_suggestions_used || 0}
              limit={user.daily_limit || 10}
              plan={user.plan || 'free'}
            />
          </View>
        )}

        {/* Plan Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Plan Actual</Text>
          <View style={[styles.planCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: theme.colors.onSurface }]}>Free</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>Gratis</Text>
              </View>
            </View>
            <Text style={[styles.planDescription, { color: theme.colors.onSurfaceVariant }]}>10 sugerencias por día</Text>

            <NeonButton
              label="Mejorar a Pro"
              onPress={() => container.toast.info('Pronto', 'Opciones de suscripción próximamente')}
              leftIcon={<MaterialCommunityIcons name="crown-outline" size={20} color="#FFF" />}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Preferencias</Text>

          <SettingItem
            icon="flag-variant"
            label="Estilo Cultural"
            value={`${currentCulture?.flag} ${currentCulture?.label}`}
            onPress={() => setShowCultureModal(true)}
            theme={theme}
          />

          <SettingItem
            icon="palette"
            label="Tono Predeterminado"
            value={`${currentToneInfo?.icon} ${currentToneInfo?.label}`}
            onPress={() => setShowToneModal(true)}
            theme={theme}
          />

          <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name={isDarkMode ? "weather-night" : "weather-sunny"}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>
                Modo Oscuro
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                container.toast.success(
                  'Tema actualizado',
                  `Modo ${value ? 'oscuro' : 'claro'} activado`
                );
              }}
              trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
              thumbColor={isDarkMode ? COLORS.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Información</Text>

          <SettingItem
            icon="information"
            label="Acerca de Labia.AI"
            onPress={() => Alert.alert('Labia.AI', 'Versión 1.0.0 (Beta)\n\nTu asistente de conversación con sabor latino')}
            theme={theme}
          />

          <SettingItem
            icon="shield-check"
            label="Privacidad y Seguridad"
            onPress={() => Alert.alert('Privacidad', 'Tus conversaciones no se almacenan permanentemente')}
            theme={theme}
          />

          <SettingItem
            icon="help-circle"
            label="Ayuda y Soporte"
            onPress={() => Alert.alert('Ayuda', 'Contacto: support@labia.chat')}
            theme={theme}
          />
        </View>

        {/* Coming Soon Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Próximamente</Text>

          <SettingItem
            icon="chart-line"
            label="Estadísticas de Uso"
            value="🚧"
            disabled={true}
            theme={theme}
          />

          <SettingItem
            icon="message-text-clock"
            label="Historial de Conversaciones"
            value="🚧"
            disabled={true}
            theme={theme}
          />

          <SettingItem
            icon="trophy-award"
            label="Logros y Progreso"
            value="🚧"
            disabled={true}
            theme={theme}
          />
        </View>

        {/* Logout */}
        <NeonButton
          label="Reiniciar App"
          onPress={handleLogout}
          leftIcon={<MaterialCommunityIcons name="logout" size={20} color="#FFF" />}
          style={{ marginTop: 8 }}
        />

        <Text style={styles.version}>Versión 1.0.0 (Beta)</Text>
      </ScrollView>

      {/* Modals */}
      <CulturalStyleModal
        visible={showCultureModal}
        selectedStyle={culturalStyle}
        onSelect={(style) => {
          setCulturalStyle(style);
          container.toast.success('Estilo actualizado', `Ahora usas el estilo ${CULTURAL_STYLES.find(s => s.value === style)?.label}`);
        }}
        onClose={() => setShowCultureModal(false)}
      />

      <ToneModal
        visible={showToneModal}
        selectedTone={defaultTone}
        onSelect={(tone) => {
          setDefaultTone(tone);
          container.toast.success('Tono actualizado', `Ahora tu tono predeterminado es ${TONES.find(t => t.value === tone)?.label}`);
        }}
        onClose={() => setShowToneModal(false)}
      />

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
          <AppBackground />
          <ScrollView style={styles.content}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>Editar Perfil</Text>

            {/* Photos grid */}
            <Text style={[styles.settingLabel, { color: theme.colors.onSurface }]}>Fotos (hasta 6)</Text>
            <View style={styles.photoGrid}>
              {photos.map((uri) => (
                <View key={uri} style={styles.photoItem}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity style={styles.photoRemove} onPress={() => removePhoto(uri)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 6 && (
                <TouchableOpacity style={[styles.photoAdd, { borderColor: '#E5E7EB' }]} onPress={openImagePicker}>
                  <MaterialCommunityIcons name="image-plus" size={28} color={theme.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            {/* Fields */}
            <TextInput placeholder="Nombre para mostrar" value={displayName} onChangeText={setDisplayName} style={styles.input} />
            <TextInput placeholder="Edad" keyboardType="number-pad" value={age} onChangeText={setAge} style={styles.input} />
            <TextInput placeholder="Género (male/female/nonbinary/other)" value={gender} onChangeText={setGender} style={styles.input} />
            <TextInput placeholder="Puesto" value={jobTitle} onChangeText={setJobTitle} style={styles.input} />
            <TextInput placeholder="Empresa" value={company} onChangeText={setCompany} style={styles.input} />
            <TextInput placeholder="Educación" value={education} onChangeText={setEducation} style={styles.input} />
            <TextInput placeholder="Altura (cm)" keyboardType="number-pad" value={heightCm} onChangeText={setHeightCm} style={styles.input} />
            <TextInput placeholder="Bio" multiline numberOfLines={4} value={bio} onChangeText={setBio} style={[styles.input, { minHeight: 100 }]} />
            <TextInput placeholder="Intereses (separados por coma)" value={interestsText} onChangeText={setInterestsText} style={styles.input} />

            <NeonButton label="Guardar" onPress={saveProfile} leftIcon={<MaterialCommunityIcons name="content-save" size={20} color="#FFF" />} />
            <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={() => setEditVisible(false)}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface SettingItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  theme: any;
}

function SettingItem({ icon, label, value, onPress, disabled, theme }: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }, disabled && styles.settingItemDisabled]}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons name={icon} size={24} color={disabled ? COLORS.text.disabled : theme.colors.onSurface} />
        <Text style={[styles.settingLabel, { color: theme.colors.onSurface }, disabled && styles.settingLabelDisabled]}>
          {label}
        </Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>{value}</Text>}
        {onPress && !disabled && (
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
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
  photoGridPreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  photoPreview: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  photoEmpty: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative'
  },
  photo: {
    width: '100%',
    height: '100%'
  },
  photoRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2
  },
  photoAdd: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB'
  },
  input: {
    backgroundColor: COLORS.surface.light,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 12
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF1F7',
    borderRadius: 12,
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
