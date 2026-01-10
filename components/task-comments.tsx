import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { Comment } from '@/lib/types';

interface TaskCommentsProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
}

export function TaskComments({ comments, onAddComment }: TaskCommentsProps) {
  const colors = useColors();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.commentHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <IconSymbol name="person.fill" size={14} color="#fff" />
        </View>
        <Text style={[styles.commentTime, { color: colors.muted }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      <Text style={[styles.commentText, { color: colors.foreground }]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconSymbol name="bubble.left.fill" size={18} color={colors.foreground} />
        <Text style={[styles.title, { color: colors.foreground }]}>
          Comentários ({comments.length})
        </Text>
      </View>

      {comments.length > 0 && (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          style={styles.commentsList}
        />
      )}

      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder="Adicionar comentário..."
          placeholderTextColor={colors.muted}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          disabled={!newComment.trim()}
          style={[
            styles.sendButton,
            { backgroundColor: newComment.trim() ? colors.primary : colors.border }
          ]}
        >
          <IconSymbol 
            name="arrow.up" 
            size={18} 
            color={newComment.trim() ? '#fff' : colors.muted} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  commentsList: {
    marginBottom: 12,
  },
  commentItem: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentTime: {
    fontSize: 12,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
