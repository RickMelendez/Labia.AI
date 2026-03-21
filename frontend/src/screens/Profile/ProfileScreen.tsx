import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, CULTURAL_STYLES, TONES } from '../../core/constants';
import { useAppStore } from '../../store/appStore';
import { useStrings } from '../../core/i18n/useStrings';
import { container } from '../../infrastructure/di/Container';
import CulturalStyleModal from '../../components/common/CulturalStyleModal';
import ToneModal from '../../components/common/ToneModal';
import UsageCard from '../../components/common/UsageCard';
import * as ImagePicker from 'expo-image-picker';
import { ProfileStorage } from '../../infrastructure/storage/ProfileStorage';
import type { DatingProfile, Language } from '../../types';

export default function ProfileScreen() {
  const s = useStrings();
  const {
    user, culturalStyle, setCulturalStyle, defaultTone, setDefaultTone,
    language, setLanguage, logout
  } = useAppStore();

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

  const currentCulture = CULTURAL_STYLES.find((cs) => cs.value === culturalStyle);
  const currentToneInfo = TONES.find((t) => t.value === defaultTone);

  const handleLogout = () => {
    Alert.alert(
      s.profile.logout,
      s.profile.logoutConfirm,
      [
        { text: s.profile.logoutCancel, style: 'cancel' },
        { text: s.profile.logout, style: 'destructive', onPress: () => logout() }
      ]
    );
  };

  const openImagePicker = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      container.toast.info('Permission needed', 'Enable photo access to add images');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 6 - photos.length,
      quality: 0.8,
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
      container.toast.info('Name required', 'Add your display name');
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
        ? interestsText.split(',').map(item => item.trim()).filter(Boolean)
        : undefined,
      photos,
    };
    await ProfileStorage.save(updated);
    setProfile(updated);
    setEditVisible(false);
    container.toast.success('Profile saved', 'Your details have been updated');

    try {
      await container.matchApi.upsertDatingProfile({
        display_name: updated.display_name,
        age: updated.age,
        gender: updated.gender,
        bio: updated.bio,
        job_title: updated.job_title,
        interests: updated.interests,
        photo_urls: [],
        is_discoverable: false,
      });
    } catch {
      // Ignore — profile saved locally
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={COLORS.gradient.primary}
          style={styles.avatarRing}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.avatarInner}>
            <MaterialCommunityIcons name="account" size={36} color={COLORS.text.secondary} />
          </View>
        </LinearGradient>
        <Text style={styles.headerName}>{user?.name || s.profile.noName}</Text>
        <Text style={styles.headerEmail}>{user?.email || ''}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Dating Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.profile.datingProfile}</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="account-heart" size={20} color={COLORS.primary} />
              <Text style={styles.cardRowText}>{profile?.display_name || s.profile.noName}</Text>
            </View>
            {photos.length > 0 && (
              <View style={styles.photoPreviewRow}>
                {photos.slice(0, 3).map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.photoPreview} />
                ))}
              </View>
            )}
            <NeonButton
              label={profile ? s.profile.editProfile : s.profile.createProfile}
              onPress={() => setEditVisible(true)}
              leftIcon={<MaterialCommunityIcons name="pencil" size={18} color="#FFF" />}
            />
          </View>
        </View>

        {/* Usage */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{s.profile.dailyUsage}</Text>
            <UsageCard
              used={user.daily_suggestions_used || 0}
              limit={user.daily_limit || 10}
              plan={user.plan || 'free'}
            />
          </View>
        )}

        {/* Plan */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.profile.currentPlan}</Text>
          <View style={styles.card}>
            <View style={styles.planRow}>
              <Text style={styles.planName}>{s.profile.free}</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{s.profile.free}</Text>
              </View>
            </View>
            <Text style={styles.planDesc}>10 {s.profile.freePerDay}</Text>
            <NeonButton
              label="Upgrade to Pro"
              onPress={() => container.toast.info('Coming soon', 'Subscription options coming soon')}
              leftIcon={<MaterialCommunityIcons name="crown-outline" size={18} color="#FFF" />}
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.profile.settings}</Text>

          {/* Language toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="translate" size={22} color={COLORS.primary} />
              <Text style={styles.settingLabel}>{s.profile.language}</Text>
            </View>
            <View style={styles.langToggle}>
              {(['en', 'es'] as Language[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  activeOpacity={0.8}
                >
                  {language === lang ? (
                    <LinearGradient
                      colors={COLORS.gradient.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.langChipActive}
                    >
                      <Text style={styles.langChipTextActive}>{lang.toUpperCase()}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.langChip}>
                      <Text style={styles.langChipText}>{lang.toUpperCase()}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <SettingRow
            icon="flag-variant"
            label={s.profile.culturalStyle}
            value={`${currentCulture?.flag} ${currentCulture?.label}`}
            onPress={() => setShowCultureModal(true)}
          />

          <SettingRow
            icon="palette"
            label={s.profile.defaultTone}
            value={`${currentToneInfo?.icon} ${currentToneInfo?.label}`}
            onPress={() => setShowToneModal(true)}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
            <MaterialCommunityIcons name="logout" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>{s.profile.logout}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modals */}
      <CulturalStyleModal
        visible={showCultureModal}
        selectedStyle={culturalStyle}
        onSelect={(style) => {
          setCulturalStyle(style);
          container.toast.success('Style updated', `Now using ${CULTURAL_STYLES.find(cs => cs.value === style)?.label} style`);
        }}
        onClose={() => setShowCultureModal(false)}
      />

      <ToneModal
        visible={showToneModal}
        selectedTone={defaultTone}
        onSelect={(tone) => {
          setDefaultTone(tone);
          container.toast.success('Tone updated', `Default tone is now ${TONES.find(t => t.value === tone)?.label}`);
        }}
        onClose={() => setShowToneModal(false)}
      />

      {/* Edit Profile Modal */}
      <Modal visible={editVisible} animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <SafeAreaView style={styles.container}>
          <AppBackground />
          <ScrollView style={styles.scroll}>
            <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Photos (up to 6)</Text>
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
                <TouchableOpacity style={styles.photoAdd} onPress={openImagePicker}>
                  <MaterialCommunityIcons name="image-plus" size={28} color={COLORS.text.secondary} />
                </TouchableOpacity>
              )}
            </View>

            <TextInput placeholder="Display name" placeholderTextColor={COLORS.text.muted} value={displayName} onChangeText={setDisplayName} style={styles.input} />
            <TextInput placeholder="Age" placeholderTextColor={COLORS.text.muted} keyboardType="number-pad" value={age} onChangeText={setAge} style={styles.input} />
            <TextInput placeholder="Gender (male/female/nonbinary/other)" placeholderTextColor={COLORS.text.muted} value={gender} onChangeText={setGender} style={styles.input} />
            <TextInput placeholder="Job title" placeholderTextColor={COLORS.text.muted} value={jobTitle} onChangeText={setJobTitle} style={styles.input} />
            <TextInput placeholder="Company" placeholderTextColor={COLORS.text.muted} value={company} onChangeText={setCompany} style={styles.input} />
            <TextInput placeholder="Education" placeholderTextColor={COLORS.text.muted} value={education} onChangeText={setEducation} style={styles.input} />
            <TextInput placeholder="Height (cm)" placeholderTextColor={COLORS.text.muted} keyboardType="number-pad" value={heightCm} onChangeText={setHeightCm} style={styles.input} />
            <TextInput placeholder="Bio" placeholderTextColor={COLORS.text.muted} multiline numberOfLines={4} value={bio} onChangeText={setBio} style={[styles.input, { minHeight: 96, textAlignVertical: 'top' }]} />
            <TextInput placeholder="Interests (comma separated)" placeholderTextColor={COLORS.text.muted} value={interestsText} onChangeText={setInterestsText} style={styles.input} />

            <NeonButton
              label={s.common.save}
              onPress={saveProfile}
              leftIcon={<MaterialCommunityIcons name="content-save" size={18} color="#FFF" />}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
              <Text style={styles.cancelText}>{s.common.cancel}</Text>
            </TouchableOpacity>
            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface SettingRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingRow({ icon, label, value, onPress }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons name={icon} size={22} color={COLORS.primary} />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.text.muted} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: COLORS.surface.dark2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  headerEmail: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.surface.light,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.shadow.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    gap: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardRowText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  photoPreviewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.surface.dark2,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  planBadge: {
    backgroundColor: COLORS.surface.tinted,
    borderWidth: 1,
    borderColor: COLORS.border.lavendar,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  planDesc: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface.light,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  langToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  langChipActive: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  langChipTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface.dark2,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.20)',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },
  version: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  // Edit modal
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  photoItem: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },
  photoAdd: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.surface.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});
