import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Image,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';

export interface AvatarMember {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

interface MemberAvatarSelectorProps {
  members: AvatarMember[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  maxVisible?: number;
  label?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function MemberAvatar({
  member,
  isSelected,
  onPress,
  size = 52,
}: {
  member: AvatarMember;
  isSelected: boolean;
  onPress: () => void;
  size?: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.avatarWrapper}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={[
            styles.avatarCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: isSelected ? 1 : 0.45,
              borderWidth: isSelected ? 2 : 0,
              borderColor: COLORS.primary,
            },
          ]}
        >
          {member.avatarUrl ? (
            <Image
              source={{ uri: member.avatarUrl }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
            />
          ) : (
            <View
              style={[
                styles.initialsCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: isSelected ? 'rgba(245,158,11,0.15)' : '#261E1A',
                },
              ]}
            >
              <Text style={[styles.initials, { color: isSelected ? COLORS.primary : COLORS.text.muted }]}>
                {getInitials(member.name)}
              </Text>
            </View>
          )}
        </View>
        {/* Plus indicator when not selected */}
        {!isSelected && (
          <View style={styles.plusBadge}>
            <MaterialCommunityIcons name="plus" size={10} color={COLORS.text.primary} />
          </View>
        )}
      </Animated.View>
      <Text style={[styles.avatarName, { color: isSelected ? COLORS.text.primary : COLORS.text.muted }]} numberOfLines={1}>
        {member.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
}

export default function MemberAvatarSelector({
  members,
  selected,
  onChange,
  max,
  maxVisible = 5,
  label,
}: MemberAvatarSelectorProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visibleMembers = members
    .sort((a, b) => {
      const aS = selected.includes(a.id);
      const bS = selected.includes(b.id);
      if (aS && !bS) return -1;
      if (!aS && bS) return 1;
      return 0;
    })
    .slice(0, maxVisible);

  const filteredAll = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email?.toLowerCase().includes(query.toLowerCase())
  );

  const toggleMember = useCallback(
    (id: string) => {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        if (max && selected.length >= max) return;
        onChange([...selected, id]);
      }
    },
    [selected, onChange, max]
  );

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.row}>
        {/* Visible avatars */}
        {visibleMembers.map((m) => (
          <MemberAvatar
            key={m.id}
            member={m}
            isSelected={selected.includes(m.id)}
            onPress={() => toggleMember(m.id)}
          />
        ))}

        {/* Add button */}
        <TouchableOpacity onPress={() => setSearchOpen(true)} style={styles.avatarWrapper} activeOpacity={0.75}>
          <View style={[styles.addCircle, searchOpen && styles.addCircleActive]}>
            <MaterialCommunityIcons
              name="plus"
              size={22}
              color={searchOpen ? COLORS.primary : COLORS.text.muted}
            />
          </View>
          <Text style={[styles.avatarName, { color: searchOpen ? COLORS.primary : COLORS.text.muted }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search sheet modal */}
      <Modal
        visible={searchOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => { setSearchOpen(false); setQuery(''); }}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {/* Search input */}
            <View style={styles.searchRow}>
              <MaterialCommunityIcons name="magnify" size={18} color={COLORS.text.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search members..."
                placeholderTextColor={COLORS.text.muted}
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>

            {/* Member list */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.memberList}>
              {filteredAll.map((m) => {
                const isSel = selected.includes(m.id);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.memberRow, isSel && styles.memberRowSelected]}
                    onPress={() => toggleMember(m.id)}
                    activeOpacity={0.7}
                  >
                    {/* Mini avatar */}
                    <View style={[styles.miniAvatar, { opacity: isSel ? 1 : 0.5 }]}>
                      {m.avatarUrl ? (
                        <Image source={{ uri: m.avatarUrl }} style={styles.miniAvatarImg} />
                      ) : (
                        <View style={[styles.miniAvatarPlaceholder, { backgroundColor: isSel ? 'rgba(245,158,11,0.15)' : '#261E1A' }]}>
                          <Text style={[styles.miniInitials, { color: isSel ? COLORS.primary : COLORS.text.muted }]}>
                            {getInitials(m.name)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {/* Info */}
                    <View style={styles.memberInfo}>
                      <Text style={[styles.memberName, { color: isSel ? COLORS.text.primary : COLORS.text.secondary }]}>
                        {m.name}
                      </Text>
                      {m.email && (
                        <Text style={styles.memberEmail} numberOfLines={1}>{m.email}</Text>
                      )}
                    </View>
                    {/* Check */}
                    <View style={[styles.checkCircle, isSel && styles.checkCircleActive]}>
                      {isSel && <MaterialCommunityIcons name="check" size={12} color={COLORS.text.onBrand} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {filteredAll.length === 0 && (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptySearchText}>No members found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    alignItems: 'center',
    gap: 5,
    minWidth: 60,
  },
  avatarCircle: {
    overflow: 'hidden',
  },
  initialsCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 60,
    textAlign: 'center',
  },
  addCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#161210',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245,158,11,0.12)',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1916',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  memberList: {
    maxHeight: 340,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  memberRowSelected: {
    backgroundColor: 'rgba(245,158,11,0.05)',
  },
  miniAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    flexShrink: 0,
  },
  miniAvatarImg: {
    width: 38,
    height: 38,
  },
  miniAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniInitials: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
  },
  memberEmail: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    color: COLORS.text.muted,
    marginTop: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emptySearch: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptySearchText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: COLORS.text.muted,
  },
});
