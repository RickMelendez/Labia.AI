import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { COLORS } from '../../core/constants';
import type { DiscoverProfile } from '../../types';

interface DiscoverCardProps {
  profile: DiscoverProfile;
  onLike: () => void;
  likeLoading?: boolean;
}

export default function DiscoverCard({ profile, onLike, likeLoading }: DiscoverCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.dark ? '#1e1a2e' : '#fff' }]}>
      {/* Photo */}
      {profile.photo_urls.length > 0 ? (
        <Image source={{ uri: profile.photo_urls[0] }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={[styles.photoPlaceholder, { backgroundColor: COLORS.brand50 }]}>
          <MaterialCommunityIcons name="account-heart" size={80} color={COLORS.primary} />
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.gradient}
      />

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name}>
          {profile.display_name}{profile.age ? `, ${profile.age}` : ''}
        </Text>
        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={2}>{profile.bio}</Text>
        ) : null}

        {/* Interest pills */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.interests}>
            {profile.interests.slice(0, 4).map((interest, i) => (
              <View key={i} style={styles.pill}>
                <Text style={styles.pillText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Like button */}
      <TouchableOpacity
        style={[styles.likeButton, likeLoading && styles.likeButtonDisabled]}
        onPress={onLike}
        disabled={likeLoading}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons
          name={likeLoading ? 'loading' : 'heart'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#5e429c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minHeight: 380,
  },
  photo: {
    width: '100%',
    height: 320,
  },
  photoPlaceholder: {
    width: '100%',
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  info: {
    position: 'absolute',
    bottom: 64,
    left: 16,
    right: 70,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  bio: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 8,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
  },
  likeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  likeButtonDisabled: {
    opacity: 0.6,
  },
});
