import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants';
import type { DiscoverProfile } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH / 2 - 20;

interface DiscoverCardProps {
  profile: DiscoverProfile;
  onLike: () => void;
  likeLoading?: boolean;
}

export default function DiscoverCard({ profile, onLike, likeLoading }: DiscoverCardProps) {
  return (
    <View style={styles.card}>
      {/* Full-bleed photo */}
      {profile.photo_urls.length > 0 ? (
        <Image source={{ uri: profile.photo_urls[0] }} style={styles.photo} resizeMode="cover" />
      ) : (
        <View style={styles.photoPlaceholder}>
          <MaterialCommunityIcons name="account-heart" size={52} color="rgba(180,140,255,0.4)" />
        </View>
      )}

      {/* Deep gradient overlay — bottom 65% */}
      <LinearGradient
        colors={['transparent', 'rgba(5,3,14,0.55)', 'rgba(5,3,14,0.93)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />

      {/* Top edge shimmer */}
      <LinearGradient
        colors={['rgba(5,3,14,0.35)', 'transparent']}
        style={styles.topFade}
      />

      {/* Info — bottom overlay */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.display_name}</Text>
          {profile.age ? (
            <Text style={styles.age}>{profile.age}</Text>
          ) : null}
        </View>

        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={1}>{profile.bio}</Text>
        ) : null}

        {/* Interest chips */}
        {profile.interests && profile.interests.length > 0 && (
          <View style={styles.chips}>
            {profile.interests.slice(0, 2).map((interest, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Like button */}
      <TouchableOpacity
        style={[styles.likeBtn, likeLoading && styles.btnDisabled]}
        onPress={onLike}
        disabled={likeLoading}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={likeLoading ? 'loading' : 'heart'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 260,
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 5,
    marginVertical: 6,
    backgroundColor: '#12092A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
  },
  photoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A0E35',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  info: {
    position: 'absolute',
    bottom: 48,
    left: 12,
    right: 44,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 0.2,
  },
  age: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  bio: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 14,
  },
  chips: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontFamily: 'Poppins_500Medium',
  },
  likeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
