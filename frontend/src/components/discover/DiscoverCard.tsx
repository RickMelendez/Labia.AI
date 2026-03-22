import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
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
          <MaterialCommunityIcons name="account-heart" size={48} color="rgba(249,112,96,0.30)" />
        </View>
      )}

      {/* Dark gradient overlay at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(12,10,8,0.55)', 'rgba(12,10,8,0.92)']}
        locations={[0, 0.45, 1]}
        style={styles.gradient}
      />

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.display_name}</Text>
          {profile.age ? <Text style={styles.age}>{profile.age}</Text> : null}
        </View>

        {profile.bio ? (
          <Text style={styles.bio} numberOfLines={1}>{profile.bio}</Text>
        ) : null}

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

      {/* Like button — rose red */}
      <TouchableOpacity
        style={[styles.likeBtn, likeLoading && styles.btnDisabled]}
        onPress={onLike}
        disabled={likeLoading}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={likeLoading ? 'loading' : 'heart'}
          size={18}
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
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 5,
    marginVertical: 6,
    backgroundColor: '#F0EDE8',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
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
    backgroundColor: '#E8E2DC',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
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
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  age: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
  bio: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    lineHeight: 14,
  },
  chips: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  chip: {
    backgroundColor: 'rgba(249,112,96,0.12)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.20)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.primary,
    fontSize: 9,
  },
  likeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondary, // rose red
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(232,85,78,0.45)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
