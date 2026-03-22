import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CULTURAL_STYLES, TONES, TYPOGRAPHY } from '../../core/constants';
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

      {/* Header — large avatar + name */}
      <View style={styles.header}>
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <MaterialCommunityIcons name="account" size={36} color={COLORS.text.muted} />
          </View>
        </View>
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
              leftIcon={<MaterialCommunityIcons name="pencil" size={18} color={COLORS.text.onBrand} />}
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
              variant="ghost"
              onPress={() => container.toast.info('Coming soon', 'Subscription options coming soon')}
              leftIcon={<MaterialCommunityIcons name="crown-outline" size={18} color={COLORS.primary} />}
            />
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.profile.settings}</Text>

          {/* Language toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="translate" size={20} color={COLORS.primary} />
              <Text style={styles.settingLabel}>{s.profile.language}</Text>
            </View>
            <View style={styles.langToggle}>
              {(['en', 'es'] as Language[]).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  activeOpacity={0.8}
                  style={[styles.langChip, language === lang && styles.langChipActive]}
                >
                  <Text style={[styles.langChipText, language === lang && styles.langChipTextActive]}>
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <SettingRow
            icon="flag-variant"
            label={s.profile.culturalStyle}
            value={`${currentCulture?.flag} ${currentCulture?.label}`}
            onPress={() => setShowCultureModal(true)}
          />

          <View style={styles.divider} />

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
            <MaterialCommunityIcons name="logout" size={18} color={COLORS.error} />
            <Text style={styles.logoutText}>{s.profile.logout}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0 (Beta)</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

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
              leftIcon={<MaterialCommunityIcons name="content-save" size={18} color={COLORS.text.onBrand} />}
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
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} />
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
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#E8E2DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  headerEmail: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
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
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#F0EDE8',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: 'rgba(0,0,0,0.08)',
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
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
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
    backgroundColor: '#E8E2DC',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text.primary,
  },
  planBadge: {
    backgroundColor: 'rgba(249,112,96,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  planBadgeText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  planDesc: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  // Flat setting rows — no card per row, separated by thin dividers
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
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
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  langToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E8E2DC',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  langChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  langChipText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  langChipTextActive: {
    color: COLORS.text.onBrand,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  version: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
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
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(249,112,96,0.20)',
    backgroundColor: '#E8E2DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  input: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    backgroundColor: '#E8E2DC',
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.12)',
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
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});
