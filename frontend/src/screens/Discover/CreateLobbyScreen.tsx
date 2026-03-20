import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import AppBackground from '../../components/common/AppBackground';
import { COLORS } from '../../core/constants';
import { useLobbyStore } from '../../store/lobbyStore';
import { container } from '../../infrastructure/di/Container';
import type { DiscoverStackParamList, ActivityType } from '../../types';

type Nav = NativeStackNavigationProp<DiscoverStackParamList>;

interface ActivityOption {
  type: ActivityType;
  icon: string;
  label: string;
}

const ACTIVITIES: ActivityOption[] = [
  { type: 'date_night',  icon: 'candle',          label: 'Date Night'  },
  { type: 'road_trip',   icon: 'car-convertible', label: 'Road Trip'   },
  { type: 'brunch',      icon: 'food-croissant',  label: 'Brunch'      },
  { type: 'adventure',   icon: 'lightning-bolt',  label: 'Adventure'   },
  { type: 'beach',       icon: 'umbrella-beach',  label: 'Beach'       },
  { type: 'concert',     icon: 'music',           label: 'Concert'     },
  { type: 'hiking',      icon: 'hiking',          label: 'Hiking'      },
  { type: 'chill',       icon: 'sofa-single',     label: 'Chill'       },
];

const CAPACITY_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function CreateLobbyScreen() {
  const theme = useTheme();
  const nav   = useNavigation<Nav>();
  const { createLobby } = useLobbyStore();

  const [activityType, setActivityType] = useState<ActivityType>('chill');
  const [name, setName]                 = useState('');
  const [description, setDescription]  = useState('');
  const [maxSize, setMaxSize]           = useState(6);
  const [locationHint, setLocationHint] = useState('');
  const [timeHint, setTimeHint]         = useState('');
  const [loading, setLoading]           = useState(false);

  const isValid = name.trim().length >= 3 && description.trim().length >= 10;

  const handleCreate = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      const lobby = await createLobby({
        name: name.trim(),
        activity_type: activityType,
        description: description.trim(),
        max_size: maxSize,
        location_hint: locationHint.trim() || undefined,
        time_window_hint: timeHint.trim() || undefined,
      });
      if (lobby) {
        container.toast.success('¡Grupo creado!', `${lobby.name} está listo`);
        nav.navigate('LobbyDetail', { lobby_id: lobby.id });
      } else {
        container.toast.error('Error', 'No se pudo crear el grupo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Grupo</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ---- Activity type grid ---- */}
          <Text style={styles.label}>Tipo de plan</Text>
          <View style={styles.activityGrid}>
            {ACTIVITIES.map(a => {
              const active = activityType === a.type;
              return (
                <TouchableOpacity
                  key={a.type}
                  style={[styles.activityTile, active && styles.activityTileActive]}
                  onPress={() => setActivityType(a.type)}
                  activeOpacity={0.75}
                >
                  <MaterialCommunityIcons
                    name={a.icon as any}
                    size={24}
                    color={active ? '#FFFFFF' : COLORS.primary}
                  />
                  <Text style={[styles.activityTileLabel, active && styles.activityTileLabelActive]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ---- Name ---- */}
          <Text style={styles.label}>Nombre del grupo <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Road trip a Miami este finde"
            placeholderTextColor="#8b7ba8"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />
          <Text style={styles.charCount}>{name.length}/100</Text>

          {/* ---- Description ---- */}
          <Text style={styles.label}>Descripción <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="¿Qué tienen pensado hacer? Cuéntales a los demás…"
            placeholderTextColor="#8b7ba8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>

          {/* ---- Capacity ---- */}
          <Text style={styles.label}>Máximo de personas</Text>
          <View style={styles.capacityRow}>
            {CAPACITY_OPTIONS.map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.capBtn, maxSize === n && styles.capBtnActive]}
                onPress={() => setMaxSize(n)}
              >
                <Text style={[styles.capBtnText, maxSize === n && styles.capBtnTextActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ---- Optional fields ---- */}
          <Text style={styles.label}>Lugar / Zona <Text style={styles.optional}>(opcional)</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Miami Beach, Wynwood…"
            placeholderTextColor="#8b7ba8"
            value={locationHint}
            onChangeText={setLocationHint}
            maxLength={200}
          />

          <Text style={styles.label}>Cuándo <Text style={styles.optional}>(opcional)</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Este sábado por la tarde"
            placeholderTextColor="#8b7ba8"
            value={timeHint}
            onChangeText={setTimeHint}
            maxLength={200}
          />

          {/* ---- CTA ---- */}
          <TouchableOpacity
            style={[styles.createBtn, (!isValid || loading) && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" />
              : <>
                  <MaterialCommunityIcons name="account-group-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.createBtnText}>Lanzar grupo</Text>
                </>
            }
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex:      { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn:     { padding: 4 },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#2d1b4e',
  },
  scroll:        { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#2d1b4e',
    marginTop: 14,
    marginBottom: 6,
  },
  required: { color: COLORS.error },
  optional: { color: '#8b7ba8', fontFamily: 'Poppins_400Regular' },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityTile: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activityTileActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  activityTileLabel: {
    fontSize: 9,
    fontFamily: 'Poppins_500Medium',
    color: COLORS.primary,
    textAlign: 'center',
  },
  activityTileLabelActive: { color: '#FFFFFF' },
  input: {
    backgroundColor: '#F3E8FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#2d1b4e',
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    color: '#8b7ba8',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    marginTop: 2,
  },
  capacityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  capBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  capBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  capBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: COLORS.primary,
  },
  capBtnTextActive: { color: '#FFFFFF' },
  createBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 100,
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
});
