import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useConversationHistoryStore, loadConversationMessages } from '../../store/conversationHistoryStore';
import { Conversation, Message } from '../../types';
import { COLORS } from '../../constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ConversationHistoryScreen() {
  const theme = useTheme();
  const { conversations, loadHistory, deleteConversation, clearHistory } = useConversationHistoryStore();
  const [selectedConversation, setSelectedConversation] = useState<{ conversation: Conversation; messages: Message[] } | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleConversationPress = async (conversation: Conversation) => {
    const messages = await loadConversationMessages(conversation.id);
    setSelectedConversation({ conversation, messages });
  };

  const handleDeleteConversation = (conversationId: string) => {
    Alert.alert(
      'Eliminar Conversación',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteConversation(conversationId),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar Historial',
      '¿Eliminar todas las conversaciones? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMM, HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.conversationLeft}>
        <MaterialCommunityIcons name="message-text" size={24} color={COLORS.primary} />
        <View style={styles.conversationInfo}>
          <Text style={[styles.conversationTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.conversationMeta, { color: theme.colors.onSurfaceVariant }]}>
            {item.message_count} mensajes • {formatDate(item.updated_at)}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDeleteConversation(item.id)}>
        <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (selectedConversation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedConversation(null)}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]} numberOfLines={1}>
            {selectedConversation.conversation.title}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={selectedConversation.messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.role === 'user' ? styles.userMessage : styles.assistantMessage,
                { backgroundColor: item.role === 'user' ? COLORS.primary : theme.colors.surface },
              ]}
            >
              <Text style={[styles.messageText, { color: item.role === 'user' ? '#FFF' : theme.colors.onSurface }]}>
                {item.text}
              </Text>
              {item.tone && (
                <Text style={[styles.messageTone, { color: item.role === 'user' ? '#FFFFFF99' : theme.colors.onSurfaceVariant }]}>
                  Tono: {item.tone}
                </Text>
              )}
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="history" size={32} color={COLORS.primary} />
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>Historial</Text>
        {conversations.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <MaterialCommunityIcons name="delete-sweep" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="message-text-outline" size={64} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>
            Sin conversaciones guardadas
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
            Tus conversaciones aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderConversationItem}
        />
      )}
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
  },
  list: {
    padding: 24,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  conversationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  conversationMeta: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  messageList: {
    padding: 24,
  },
  messageBubble: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTone: {
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
});
