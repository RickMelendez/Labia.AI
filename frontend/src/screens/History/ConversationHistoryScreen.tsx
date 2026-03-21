import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBackground from '../../components/common/AppBackground';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useConversationHistoryStore, loadConversationMessages } from '../../store/conversationHistoryStore';
import { useAppStore } from '../../store/appStore';
import { useStrings } from '../../core/i18n/useStrings';
import { Conversation, Message } from '../../types';
import { COLORS } from '../../core/constants';
import { format } from 'date-fns';

function formatDate(dateString: string) {
  try {
    return format(new Date(dateString), 'MMM d, h:mm a');
  } catch {
    return dateString;
  }
}

export default function ConversationHistoryScreen() {
  const s = useStrings();
  const { user } = useAppStore();
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
            <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.text.primary} />
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
                <LinearGradient
                  colors={COLORS.gradient.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.bubbleGradient}
                >
                  <Text style={styles.userText}>{item.text}</Text>
                  {item.tone && <Text style={styles.toneLabel}>Tone: {item.tone}</Text>}
                </LinearGradient>
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

      {/* Active matches strip (avatar circles — placeholder for future real matches) */}
      {user && (
        <View style={styles.matchesStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchesContent}>
            <Text style={styles.matchesLabel}>{s.history.activeMatches}</Text>
            {/* Placeholder avatar circles */}
            {[...Array(5)].map((_, i) => (
              <View key={i} style={styles.matchAvatar}>
                <LinearGradient
                  colors={COLORS.gradient.primary}
                  style={styles.matchAvatarGradient}
                >
                  <MaterialCommunityIcons name="account" size={20} color="#FFF" />
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <MaterialCommunityIcons name="message-text-outline" size={40} color={COLORS.primary} />
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
              <View style={styles.convIconWrap}>
                <MaterialCommunityIcons name="message-text" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.convInfo}>
                <Text style={styles.convTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.convMeta}>
                  {item.message_count} messages · {formatDate(item.updated_at)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <MaterialCommunityIcons name="delete-outline" size={18} color={COLORS.text.muted} />
              </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  clearBtn: {
    padding: 4,
  },
  matchesStrip: {
    marginBottom: 8,
  },
  matchesContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  matchesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginRight: 4,
  },
  matchAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  matchAvatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: 24,
    paddingBottom: 100,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.light,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.shadow.card,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  convIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface.tinted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  convInfo: {
    flex: 1,
  },
  convTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  convMeta: {
    fontSize: 12,
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.surface.tinted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border.lavendar,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
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
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface.dark2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
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
    borderRadius: 18,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
  },
  bubbleGradient: {
    padding: 14,
  },
  assistantBubbleInner: {
    backgroundColor: COLORS.surface.dark2,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    padding: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text.primary,
  },
  toneLabel: {
    fontSize: 11,
    marginTop: 6,
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
  },
});
