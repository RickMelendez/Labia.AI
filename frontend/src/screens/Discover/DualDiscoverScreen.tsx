import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppBackground from '../../components/common/AppBackground';
import DiscoverCard from '../../components/discover/DiscoverCard';
import LobbyCard from '../../components/discover/LobbyCard';
import { COLORS } from '../../core/constants';
import { container } from '../../infrastructure/di/Container';
import { useLobbyStore } from '../../store/lobbyStore';
import type { DiscoverProfile, DiscoverStackParamList } from '../../types';

type DiscoverNav = NativeStackNavigationProp<DiscoverStackParamList>;

export default function DualDiscoverScreen() {
  const navigation = useNavigation<DiscoverNav>();

  // ---- Profile state ----
  const [profiles, setProfiles] = React.useState<DiscoverProfile[]>([]);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [profilesLoading, setProfilesLoading] = React.useState(false);
  const [likingId, setLikingId] = React.useState<number | null>(null);
  const LIMIT = 20;

  // ---- Lobby state ----
  const { lobbies, lobbiesLoading, fetchLobbies } = useLobbyStore();

  // ---- Animated divider glow ----
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.9, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchProfiles();
    fetchLobbies();
  }, []);

  const fetchProfiles = useCallback(async () => {
    if (profilesLoading || !hasMore) return;
    setProfilesLoading(true);
    try {
      const data = await container.matchApi.getDiscoverFeed(LIMIT, offset);
      setProfiles(prev => [...prev, ...data.profiles]);
      setOffset(prev => prev + data.profiles.length);
      setHasMore(data.has_more);
    } catch {
      container.toast.error('Error', 'No se pudo cargar el feed');
    } finally {
      setProfilesLoading(false);
    }
  }, [profilesLoading, hasMore, offset]);

  const handleLike = async (profile: DiscoverProfile) => {
    if (likingId) return;
    setLikingId(profile.user_id);
    try {
      const result = await container.matchApi.likeUser(profile.user_id);
      setProfiles(prev => prev.filter(p => p.user_id !== profile.user_id));
      if (result.is_mutual_match && result.match_id) {
        container.toast.success('¡Match! 💜', `Tú y ${profile.display_name} se gustaron`);
        navigation.navigate('MatchOnboarding', { match_id: result.match_id });
      } else {
        container.toast.success('Like enviado', `Le diste like a ${profile.display_name}`);
      }
    } catch {
      container.toast.error('Error', 'No se pudo enviar el like');
    } finally {
      setLikingId(null);
    }
  };

  const renderProfile = useCallback(({ item }: { item: DiscoverProfile }) => (
    <DiscoverCard
      profile={item}
      onLike={() => handleLike(item)}
      likeLoading={likingId === item.user_id}
    />
  ), [likingId]);

  const renderLobby = useCallback(({ item }: { item: typeof lobbies[0] }) => (
    <LobbyCard
      lobby={item}
      onPress={() => navigation.navigate('LobbyDetail', { lobby_id: item.id })}
    />
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />

      {/* ---- Header ---- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>DESCUBRIR</Text>
          <Text style={styles.title}>Explorar</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('CreateLobby')}
          >
            <LinearGradient
              colors={['rgba(183,148,246,0.15)', 'rgba(94,66,156,0.15)']}
              style={styles.headerBtnGrad}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.accent} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('MatchOnboarding', { match_id: 0 } as any)}
          >
            <LinearGradient
              colors={['rgba(244,146,240,0.15)', 'rgba(224,113,219,0.15)']}
              style={styles.headerBtnGrad}
            >
              <MaterialCommunityIcons name="heart-multiple-outline" size={20} color={COLORS.secondary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---- Column labels ---- */}
      <View style={styles.columnLabels}>
        <View style={styles.colLabel}>
          <MaterialCommunityIcons name="account-heart-outline" size={12} color="rgba(255,255,255,0.35)" />
          <Text style={styles.colLabelText}>Perfiles</Text>
          <MaterialCommunityIcons name="arrow-up" size={10} color="rgba(255,255,255,0.25)" />
        </View>
        <View style={{ width: 1 }} />
        <View style={styles.colLabel}>
          <MaterialCommunityIcons name="account-group-outline" size={12} color="rgba(255,255,255,0.35)" />
          <Text style={styles.colLabelText}>Grupos</Text>
          <MaterialCommunityIcons name="arrow-down" size={10} color="rgba(255,255,255,0.25)" />
        </View>
      </View>

      {/* ---- Dual scroll body ---- */}
      <View style={styles.body}>
        {/* Left column — profiles */}
        <FlatList
          style={styles.column}
          data={profiles}
          keyExtractor={item => `profile-${item.user_id}`}
          renderItem={renderProfile}
          onEndReached={fetchProfiles}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            profilesLoading
              ? <ActivityIndicator color={COLORS.accent} style={{ marginVertical: 16 }} size="small" />
              : null
          }
          ListEmptyComponent={
            !profilesLoading ? (
              <View style={styles.emptyCol}>
                <MaterialCommunityIcons name="heart-search" size={36} color="rgba(183,148,246,0.25)" />
                <Text style={styles.emptyText}>Sin perfiles</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        />

        {/* Animated glowing divider */}
        <View style={styles.dividerWrapper}>
          <Animated.View style={[styles.dividerGlow, { opacity: glowAnim }]} />
          <View style={styles.divider} />
        </View>

        {/* Right column — lobbies (inverted scroll) */}
        <FlatList
          style={styles.column}
          data={lobbies}
          keyExtractor={item => `lobby-${item.id}`}
          renderItem={renderLobby}
          inverted
          showsVerticalScrollIndicator={false}
          onRefresh={fetchLobbies}
          refreshing={lobbiesLoading}
          ListEmptyComponent={
            !lobbiesLoading ? (
              <View style={styles.emptyCol}>
                <MaterialCommunityIcons name="account-group-outline" size={36} color="rgba(183,148,246,0.25)" />
                <Text style={styles.emptyText}>Crea el{'\n'}primer grupo</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        />
      </View>

      {/* ---- FAB ---- */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLobby')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGrad}
        >
          <MaterialCommunityIcons name="account-group-outline" size={18} color="#fff" />
          <Text style={styles.fabText}>Nuevo Grupo</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(183,148,246,0.55)',
    letterSpacing: 2,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerBtnGrad: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  columnLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  colLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  colLabelText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  dividerWrapper: {
    width: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: COLORS.primary + '30',
    borderRadius: 4,
  },
  emptyCol: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  fabGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 100,
  },
  fabText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
