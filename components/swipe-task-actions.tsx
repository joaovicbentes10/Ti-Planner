import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, PanResponder, Text } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { TaskStatus, STATUS_CONFIG } from '@/lib/types';

interface SwipeTaskActionsProps {
  children: React.ReactNode;
  onStatusChange: (status: TaskStatus) => void;
  currentStatus: TaskStatus;
}

const SWIPE_THRESHOLD = 80;

export function SwipeTaskActions({
  children,
  onStatusChange,
  currentStatus,
}: SwipeTaskActionsProps) {
  const colors = useColors();
  const pan = useRef(new Animated.ValueXY()).current;
  const [isOpen, setIsOpen] = React.useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (e, { dx }) => {
        if (dx < -SWIPE_THRESHOLD) {
          // Swiped left - open actions
          Animated.spring(pan, {
            toValue: { x: -100, y: 0 },
            useNativeDriver: false,
          }).start();
          setIsOpen(true);
        } else if (dx > SWIPE_THRESHOLD || isOpen) {
          // Swiped right or close
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          setIsOpen(false);
        }
      },
    })
  ).current;

  const getNextStatus = (): TaskStatus => {
    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done', 'blocked'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    return statusOrder[nextIndex];
  };

  const handleStatusChange = (status: TaskStatus) => {
    onStatusChange(status);
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Background actions */}
      <View style={[styles.actionsBackground, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: STATUS_CONFIG.done.color }]}
          onPress={() => handleStatusChange('done')}
        >
          <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
          <Text style={styles.actionText}>Concluir</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: STATUS_CONFIG.in_progress.color }]}
          onPress={() => handleStatusChange('in_progress')}
        >
          <IconSymbol name="play.fill" size={20} color="#fff" />
          <Text style={styles.actionText}>Iniciar</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionsBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    zIndex: 1,
  },
});
