import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Image, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import type { Lobby, ActivityType, EnergyLevel } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH / 2 - 20;

const ACTIVITY_META: Record<ActivityType, { icon: string; label: string; color: string }> = {
  date_night:  { icon: 'candle',          label: 'Date Night', color: '#FF6B9D' },
  road_trip:   { icon: 'car-convertible', label: 'Road Trip',  color: '#FFB347' },
  brunch:      { icon: 'food-croissant',  label: 'Brunch',     color: '#A8E6CF' },
  adventure:   { icon: 'lightning-bolt',  label: 'Adventure',  color: '#FFD700' },
  beach:       { icon: 'umbrella-beach',  label: 'Beach',      color: '#4FC3F7' },
  concert:     { icon: 'music',           label: 'Concert',    color: '#CE93D8' },
  hiking:      { icon: 'hiking',          label: 'Hiking',     color: '#81C784' },
  chill:       { icon: 'sofa-single',     label: 'Chill',      color: '#B39DDB' },
};

const ENERGY_META: Record<EnergyLevel, { color: string; label: string }> = {
  empty:   { color: '#4a4060', label: 'empty'   },
  warm:    { color: '#F97060', label: 'warm'    },
  buzzing: { color: '#10B981', label: 'buzzing' },
  full:    { color: '#7B5FFF', label: 'full'    },
};

function formatExpiry(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

interface Props {
  lobby: Lobby;
  onPress: () => void;
}

export default function LobbyCard({ lobby, onPress }: Props) {
  const meta   = ACTIVITY_META[lobby.activity_type] ?? ACTIVITY_META.chill;
  const energy = ENERGY_META[lobby.energy_level];

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (lobby.energy_level === 'buzzing' || lobby.energy_level === 'full') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.2, duration: 900, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1,   duration: 900, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [lobby.energy_level]);

  const expiry = formatExpiry(lobby.expires_at);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Activity badge */}
      <View style={[styles.activityBadge, { backgroundColor: meta.color + '22' }]}>
        <MaterialCommunityIcons name={meta.icon as any} size={11} color={meta.color} />
        <Text style={[styles.activityLabel, { color: meta.color }]}>{meta.label}</Text>
      </View>

      {/* Lobby name */}
      <Text style={styles.name} numberOfLines={2}>{lobby.name}</Text>

      {/* Creator row */}
      <View style={styles.creatorRow}>
        {lobby.creator_photo ? (
          <Image source={{ uri: lobby.creator_photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <MaterialCommunityIcons name="account" size={10} color={COLORS.primary} />
          </View>
        )}
        <Text style={styles.creatorName} numberOfLines={1}>{lobby.creator_name}</Text>
      </View>

      {/* Member fill bar */}
      <View style={styles.memberRow}>
        <MaterialCommunityIcons name="account-multiple" size={11} color={COLORS.text.muted} />
        <Text style={styles.memberCount}>{lobby.member_count}/{lobby.max_size}</Text>
        <View style={styles.fillTrack}>
          <View
            style={[
              styles.fillBar,
              {
                width: `${Math.min((lobby.member_count / lobby.max_size) * 100, 100)}%` as any,
                backgroundColor: energy.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Bottom: energy + expiry */}
      <View style={styles.bottomRow}>
        <Animated.View
          style={[
            styles.energyBadge,
            { backgroundColor: energy.color + '20', transform: [{ scale: pulse }] },
          ]}
        >
          <View style={[styles.energyDot, { backgroundColor: energy.color }]} />
          <Text style={[styles.energyText, { color: energy.color }]}>{energy.label}</Text>
        </Animated.View>

        <View style={styles.expiryBadge}>
          <MaterialCommunityIcons name="clock-outline" size={9} color={COLORS.text.muted} />
          <Text style={styles.expiryText}>{expiry}</Text>
        </View>
      </View>

      {/* Joined badge */}
      {lobby.is_member && (
        <View style={styles.joinedBadge}>
          <MaterialCommunityIcons name="check-circle" size={9} color={COLORS.primary} />
          <Text style={[styles.joinedText, { color: COLORS.primary }]}>Joined</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 5,
    marginVertical: 6,
    backgroundColor: '#F0EDE8',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
    gap: 7,
    shadowColor: 'rgba(0,0,0,0.10)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  activityLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  name: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 18,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(249,112,96,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorName: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 10,
    color: COLORS.text.muted,
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memberCount: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: 10,
    color: COLORS.text.secondary,
  },
  fillTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 2,
    opacity: 0.85,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 100,
  },
  energyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  energyText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: 9,
    textTransform: 'capitalize',
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expiryText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 9,
    color: COLORS.text.muted,
  },
  joinedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(249,112,96,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 100,
  },
  joinedText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 8,
    fontWeight: '600',
  },
});
