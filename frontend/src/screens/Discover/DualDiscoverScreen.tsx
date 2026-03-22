import React, { useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import DiscoverCard from '../../components/discover/DiscoverCard';
import LobbyCard from '../../components/discover/LobbyCard';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import { useStrings } from '../../core/i18n/useStrings';
import { container } from '../../infrastructure/di/Container';
import { useLobbyStore } from '../../store/lobbyStore';
import type { DiscoverProfile, DiscoverStackParamList } from '../../types';

type DiscoverNav = NativeStackNavigationProp<DiscoverStackParamList>;

export default function DualDiscoverScreen() {
  const navigation = useNavigation<DiscoverNav>();
  const s = useStrings();

  // ---- Profile state ----
  const [profiles, setProfiles] = React.useState<DiscoverProfile[]>([]);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [profilesLoading, setProfilesLoading] = React.useState(false);
  const [likingId, setLikingId] = React.useState<number | null>(null);
  const LIMIT = 20;

  // ---- Lobby state ----
  const { lobbies, lobbiesLoading, fetchLobbies } = useLobbyStore();

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
      container.toast.error('Error', 'Could not load feed');
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
        container.toast.success("It's a Match!", `You and ${profile.display_name} liked each other`);
        navigation.navigate('MatchOnboarding', { match_id: result.match_id });
      } else {
        container.toast.success('Liked!', `You liked ${profile.display_name}`);
      }
    } catch {
      container.toast.error('Error', 'Could not send like');
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('MatchOnboarding', { match_id: 0 } as any)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="heart-multiple-outline" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Column labels */}
      <View style={styles.columnLabels}>
        <View style={styles.colLabel}>
          <MaterialCommunityIcons name="account-heart-outline" size={11} color={COLORS.text.muted} />
          <Text style={styles.colLabelText}>Profiles</Text>
        </View>
        <View style={{ width: 1 }} />
        <View style={styles.colLabel}>
          <MaterialCommunityIcons name="account-group-outline" size={11} color={COLORS.text.muted} />
          <Text style={styles.colLabelText}>Lobbies</Text>
        </View>
      </View>

      {/* Dual scroll body */}
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
              ? <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} size="small" />
              : null
          }
          ListEmptyComponent={
            !profilesLoading ? (
              <View style={styles.emptyCol}>
                <MaterialCommunityIcons name="heart-search" size={32} color="rgba(245,158,11,0.25)" />
                <Text style={styles.emptyText}>No profiles</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right column — lobbies */}
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
                <MaterialCommunityIcons name="account-group-outline" size={32} color="rgba(245,158,11,0.25)" />
                <Text style={styles.emptyText}>Create the{'\n'}first lobby</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
        />
      </View>

      {/* FAB — amber solid */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLobby')}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="account-group-outline" size={16} color={COLORS.text.onBrand} />
        <Text style={styles.fabText}>New Lobby</Text>
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
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E1916',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  emptyCol: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
    paddingHorizontal: 12,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 10,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(245,158,11,0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 10,
  },
  fabText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    color: COLORS.text.onBrand,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
