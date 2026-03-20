import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import AppBackground from '../../components/common/AppBackground';
import { COLORS } from '../../core/constants';
import { useLobbyStore } from '../../store/lobbyStore';
import { useAppStore } from '../../store/appStore';
import { container } from '../../infrastructure/di/Container';
import type { DiscoverStackParamList, LobbyMessage } from '../../types';

type Route = RouteProp<DiscoverStackParamList, 'LobbyDetail'>;
type Nav   = NativeStackNavigationProp<DiscoverStackParamList>;

const ACTIVITY_ICONS: Record<string, string> = {
  date_night: 'candle', road_trip: 'car-convertible', brunch: 'food-croissant',
  adventure: 'lightning-bolt', beach: 'umbrella-beach', concert: 'music',
  hiking: 'hiking', chill: 'sofa-single',
};

export default function LobbyDetailScreen() {
  const theme   = useTheme();
  const nav     = useNavigation<Nav>();
  const route   = useRoute<Route>();
  const { lobby_id } = route.params;

  const { activeLobby, activeLobbyLoading, messages, fetchLobbyDetail,
          fetchMessages, sendMessage, joinLobby, leaveLobby,
          startPolling, stopPolling } = useLobbyStore();

  const currentUser = useAppStore(s => s.user);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchLobbyDetail(lobby_id);
    fetchMessages(lobby_id);
    startPolling(lobby_id);
    return () => stopPolling();
  }, [lobby_id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setText('');
    setSending(true);
    try {
      await sendMessage(lobby_id, content);
    } catch {
      container.toast.error('Error', 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleJoin = async () => {
    const result = await joinLobby(lobby_id);
    if (result) {
      container.toast.success('¡Unido!', `Ya eres parte de ${activeLobby?.name}`);
      fetchMessages(lobby_id);
      startPolling(lobby_id);
    } else {
      container.toast.error('Error', 'No se pudo unir al grupo');
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Salir del grupo',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await leaveLobby(lobby_id);
            nav.goBack();
          },
        },
      ],
    );
  };

  const renderMessage = useCallback(({ item }: { item: LobbyMessage }) => {
    const isMe = item.user_id === Number(currentUser?.id);
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          item.sender_photo
            ? <Image source={{ uri: item.sender_photo }} style={styles.msgAvatar} />
            : <View style={[styles.msgAvatar, styles.avatarPlaceholder]}>
                <MaterialCommunityIcons name="account" size={14} color={COLORS.primary} />
              </View>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          {!isMe && (
            <Text style={styles.bubbleSender}>{item.sender_name}</Text>
          )}
          <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
        </View>
      </View>
    );
  }, [currentUser]);

  if (activeLobbyLoading || !activeLobby) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppBackground />
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const activityIcon = ACTIVITY_ICONS[activeLobby.activity_type] ?? 'account-group';
  const isMember = activeLobby.is_member;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />
      <KeyboardAvoidingView
        style={styles.kvFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.activityIconWrap}>
              <MaterialCommunityIcons name={activityIcon as any} size={15} color={COLORS.accent} />
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>{activeLobby.name}</Text>
          </View>
          {isMember && (
            <TouchableOpacity onPress={handleLeave} style={styles.leaveBtn}>
              <Text style={styles.leaveText}>Salir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ---- Members strip ---- */}
        <View style={styles.membersStrip}>
          <FlatList
            horizontal
            data={activeLobby.members}
            keyExtractor={m => String(m.user_id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
            renderItem={({ item }) => (
              <View style={styles.memberChip}>
                {item.photo_url
                  ? <Image source={{ uri: item.photo_url }} style={styles.memberAvatar} />
                  : <View style={[styles.memberAvatar, styles.avatarPlaceholder]}>
                      <MaterialCommunityIcons name="account" size={14} color={COLORS.primary} />
                    </View>
                }
                <Text style={styles.memberName} numberOfLines={1}>{item.display_name.split(' ')[0]}</Text>
              </View>
            )}
            ListFooterComponent={
              activeLobby.spots_left > 0 ? (
                <View style={styles.spotsChip}>
                  <MaterialCommunityIcons name="plus" size={12} color="#8b7ba8" />
                  <Text style={styles.spotsText}>{activeLobby.spots_left} spots left</Text>
                </View>
              ) : null
            }
          />
        </View>

        {/* ---- Chat messages ---- */}
        {isMember ? (
          <FlatList
            ref={listRef}
            style={styles.chatList}
            data={messages}
            keyExtractor={item => String(item.id)}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContent}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <MaterialCommunityIcons name="chat-outline" size={40} color={COLORS.primary + '55'} />
                <Text style={styles.emptyChatText}>Sé el primero en escribir</Text>
              </View>
            }
          />
        ) : (
          <View style={styles.notMemberBanner}>
            <MaterialCommunityIcons name="lock-outline" size={32} color={COLORS.primary + '88'} />
            <Text style={styles.notMemberText}>Únete para ver el chat del grupo</Text>
            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
              <Text style={styles.joinBtnText}>Unirse al grupo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ---- Input bar (only if member) ---- */}
        {isMember && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Escribe un mensaje…"
              placeholderTextColor="#8b7ba8"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
              }
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kvFlex:    { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { padding: 4 },
  activityIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(183,148,246,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  leaveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  leaveText: {
    color: '#EF4444',
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
  },
  membersStrip: {
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  memberChip: {
    alignItems: 'center',
    gap: 4,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(183,148,246,0.35)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(183,148,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberName: {
    fontSize: 9,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.4)',
    maxWidth: 44,
  },
  spotsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
  },
  spotsText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'Poppins_400Regular',
  },
  chatList: { flex: 1 },
  chatContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 2,
  },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(183,148,246,0.25)',
  },
  bubble: {
    maxWidth: '72%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 2,
  },
  bubbleOther: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  bubbleSender: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.accent,
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  bubbleTextMe: { color: '#FFFFFF' },
  emptyChat: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyChatText: {
    color: 'rgba(255,255,255,0.25)',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
  },
  notMemberBanner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  notMemberText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(5,3,14,0.6)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
