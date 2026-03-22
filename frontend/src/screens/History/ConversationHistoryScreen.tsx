import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackground from '../../components/common/AppBackground';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useConversationHistoryStore, loadConversationMessages } from '../../store/conversationHistoryStore';
import { useStrings } from '../../core/i18n/useStrings';
import { Conversation, Message } from '../../types';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import { format } from 'date-fns';

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), 'MMM d, h:mm a');
  } catch {
    return dateString;
  }
}

function getInitials(title: string): string {
  return title
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ConversationHistoryScreen() {
  const s = useStrings();
  const { conversations, loadHistory, deleteConversation, clearHistory } = useConversationHistoryStore();
  const [selectedConversation, setSelectedConversation] = useState<{ conversation: Conversation; messages: Message[] } | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleConversationPress = async (conversation: Conversation) => {
    const messages = await loadConversationMessages(conversation.id);
    setSelectedConversation({ conversation, messages });
  };

  const handleDelete = (conversationId: string) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure? This cannot be undone.',
      [
        { text: s.common.cancel, style: 'cancel' },
        { text: s.common.delete, style: 'destructive', onPress: () => deleteConversation(conversationId) },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'Delete all conversations? This cannot be undone.',
      [
        { text: s.common.cancel, style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearHistory() },
      ]
    );
  };

  // ---- Detail view ----
  if (selectedConversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppBackground />
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.detailTitle} numberOfLines={1}>
            {selectedConversation.conversation.title}
          </Text>
          <View style={{ width: 38 }} />
        </View>
        <FlatList
          data={selectedConversation.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}>
              {item.role === 'user' ? (
                <View style={styles.userBubbleInner}>
                  <Text style={styles.userText}>{item.text}</Text>
                  {item.tone && <Text style={styles.toneLabel}>Tone: {item.tone}</Text>}
                </View>
              ) : (
                <View style={styles.assistantBubbleInner}>
                  <Text style={styles.assistantText}>{item.text}</Text>
                  {item.tone && <Text style={styles.toneLabel}>Tone: {item.tone}</Text>}
                </View>
              )}
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  // ---- List view ----
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{s.history.title}</Text>
        {conversations.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <MaterialCommunityIcons name="delete-sweep-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="message-text-outline" size={38} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>{s.history.empty}</Text>
          <Text style={styles.emptySubtitle}>{s.history.emptySubtitle}</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convCard}
              onPress={() => handleConversationPress(item)}
              activeOpacity={0.75}
            >
              {/* Avatar circle with initials */}
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>{getInitials(item.title)}</Text>
              </View>

              <View style={styles.convInfo}>
                <Text style={styles.convTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.convMeta}>
                  {item.message_count} messages · {formatDate(item.updated_at)}
                </Text>
              </View>

              {/* Unread dot placeholder */}
              <View style={styles.convRight}>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  clearBtn: {
    padding: 4,
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 100,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDE8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  convAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249,112,96,0.10)',
    borderWidth: 1.5,
    borderColor: 'rgba(249,112,96,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  convAvatarText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  convInfo: {
    flex: 1,
  },
  convTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  convMeta: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  convRight: {
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    padding: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249,112,96,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.20)',
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Detail view
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8E2DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  messageList: {
    padding: 24,
    paddingBottom: 100,
  },
  messageBubble: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  userBubbleInner: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  assistantBubbleInner: {
    backgroundColor: '#E8E2DC',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  userText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text.onBrand,
  },
  assistantText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text.primary,
  },
  toneLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 11,
    marginTop: 6,
    color: 'rgba(28,25,23,0.5)',
    fontStyle: 'italic',
  },
});
