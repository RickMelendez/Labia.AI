import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import AppBackground from '../../components/common/AppBackground';
import DiscoverCard from '../../components/discover/DiscoverCard';
import { COLORS } from '../../core/constants';
import { container } from '../../infrastructure/di/Container';
import type { DiscoverProfile, DiscoverStackParamList } from '../../types';

type DiscoverNav = NativeStackNavigationProp<DiscoverStackParamList>;

export default function DiscoverFeedScreen() {
  const theme = useTheme();
  const navigation = useNavigation<DiscoverNav>();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [likingId, setLikingId] = useState<number | null>(null);
  const LIMIT = 20;

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await container.matchApi.getDiscoverFeed(LIMIT, offset);
      setProfiles(prev => [...prev, ...data.profiles]);
      setOffset(prev => prev + data.profiles.length);
      setHasMore(data.has_more);
    } catch (e) {
      container.toast.error('Error', 'No se pudo cargar el feed');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset]);

  useEffect(() => {
    fetchMore();
  }, []);

  const handleLike = async (profile: DiscoverProfile) => {
    if (likingId) return;
    setLikingId(profile.user_id);
    try {
      const result = await container.matchApi.likeUser(profile.user_id);
      // Remove liked profile from feed
      setProfiles(prev => prev.filter(p => p.user_id !== profile.user_id));

      if (result.is_mutual_match && result.match_id) {
        container.toast.success('¡Match! 💜', `Tú y ${profile.display_name} se gustaron`);
        navigation.navigate('MatchOnboarding', { match_id: result.match_id });
      } else {
        container.toast.success('Like enviado', `Le diste like a ${profile.display_name}`);
      }
    } catch (e) {
      container.toast.error('Error', 'No se pudo enviar el like');
    } finally {
      setLikingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]} edges={['top']}>
      <AppBackground />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Descubrir</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MatchOnboarding', { match_id: 0 } as any)}>
          <MaterialCommunityIcons name="heart-multiple-outline" size={26} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={profiles}
        keyExtractor={item => String(item.user_id)}
        renderItem={({ item }) => (
          <DiscoverCard
            profile={item}
            onLike={() => handleLike(item)}
            likeLoading={likingId === item.user_id}
          />
        )}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="heart-search" size={64} color={COLORS.primary} />
              <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
                No hay más perfiles por ahora
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
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
    paddingVertical: 12,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
});
