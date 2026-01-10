import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform, Vibration } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useTaskContext } from '@/lib/task-context';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';

type TimerMode = 'work' | 'short_break' | 'long_break';

const MODE_CONFIG: Record<TimerMode, { label: string; color: string }> = {
  work: { label: 'Foco', color: '#6366F1' },
  short_break: { label: 'Pausa Curta', color: '#10B981' },
  long_break: { label: 'Pausa Longa', color: '#3B82F6' },
};

export default function TimerScreen() {
  const colors = useColors();
  const { settings, addPomodoroSession, tasks } = useTaskContext();
  
  const [mode, setMode] = useState<TimerMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro.workDuration * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const animatedProgress = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep screen awake while timer is running
  useKeepAwake();

  const getDuration = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case 'work': return settings.pomodoro.workDuration * 60;
      case 'short_break': return settings.pomodoro.shortBreakDuration * 60;
      case 'long_break': return settings.pomodoro.longBreakDuration * 60;
    }
  }, [settings.pomodoro]);

  const resetTimer = useCallback((newMode?: TimerMode) => {
    const targetMode = newMode || mode;
    const duration = getDuration(targetMode);
    setTimeLeft(duration);
    setIsRunning(false);
    animatedProgress.setValue(1);
    if (newMode) setMode(newMode);
  }, [mode, getDuration, animatedProgress]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          const totalDuration = getDuration(mode);
          animatedProgress.setValue(newTime / totalDuration);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer completed
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, getDuration]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    // Vibrate and haptic feedback
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 500, 200, 500]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (mode === 'work') {
      // Save pomodoro session
      await addPomodoroSession({
        taskId: selectedTaskId || undefined,
        duration: settings.pomodoro.workDuration,
        type: 'work',
      });

      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);

      // Determine next break type
      if (newSessionsCompleted % settings.pomodoro.sessionsUntilLongBreak === 0) {
        resetTimer('long_break');
      } else {
        resetTimer('short_break');
      }
    } else {
      // Break completed, back to work
      resetTimer('work');
    }
  };

  const toggleTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsRunning(!isRunning);
  };

  const skipTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (mode === 'work') {
      resetTimer('short_break');
    } else {
      resetTimer('work');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeConfig = MODE_CONFIG[mode];
  const totalDuration = getDuration(mode);
  const progress = timeLeft / totalDuration;

  // Calculate circle properties
  const size = 280;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  const incompleteTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Pomodoro</Text>
          <View style={styles.sessionsBadge}>
            <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
            <Text style={[styles.sessionsText, { color: colors.foreground }]}>
              {sessionsCompleted} sessões
            </Text>
          </View>
        </View>

        {/* Timer Circle - Moved to top */}
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            {/* Background circle */}
            <View style={[
              styles.circleBackground,
              { 
                width: size, 
                height: size, 
                borderRadius: size / 2,
                borderColor: colors.border,
              }
            ]} />
            
            {/* Progress indicator (simplified) */}
            <View style={[
              styles.progressRing,
              {
                width: size - 20,
                height: size - 20,
                borderRadius: (size - 20) / 2,
                borderColor: modeConfig.color,
                borderWidth: strokeWidth,
                opacity: 0.2,
              }
            ]} />
            
            <Animated.View style={[
              styles.progressRing,
              {
                width: size - 20,
                height: size - 20,
                borderRadius: (size - 20) / 2,
                borderColor: modeConfig.color,
                borderWidth: strokeWidth,
                borderTopColor: 'transparent',
                borderRightColor: 'transparent',
                transform: [{ rotate: `${(1 - progress) * 360}deg` }],
              }
            ]} />

            {/* Time display */}
            <View style={styles.timeDisplay}>
              <Text style={[styles.timeText, { color: colors.foreground }]}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={[styles.modeLabel, { color: modeConfig.color }]}>
                {modeConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Mode Tabs - Moved below timer - Disabled when running */}
        <View style={[styles.modeTabs, { backgroundColor: colors.surface, opacity: isRunning ? 0.5 : 1 }]}>
          {(Object.keys(MODE_CONFIG) as TimerMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeTab,
                mode === m && { backgroundColor: MODE_CONFIG[m].color },
                isRunning && { pointerEvents: 'none' }
              ]}
              onPress={() => !isRunning && resetTimer(m)}
              activeOpacity={isRunning ? 1 : 0.7}
              disabled={isRunning}
            >
              <Text style={[
                styles.modeTabText,
                { color: mode === m ? '#fff' : colors.muted }
              ]}>
                {MODE_CONFIG[m].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.surface }]}
            onPress={() => resetTimer()}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.counterclockwise" size={24} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: modeConfig.color }]}
            onPress={toggleTimer}
            activeOpacity={0.8}
          >
            <IconSymbol 
              name={isRunning ? "pause.fill" : "play.fill"} 
              size={32} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.surface }]}
            onPress={skipTimer}
            activeOpacity={0.7}
          >
            <IconSymbol name="forward.fill" size={24} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Selected Task */}
        {selectedTask ? (
          <View style={[styles.selectedTask, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.selectedTaskContent}>
              <IconSymbol name="checklist" size={18} color={colors.primary} />
              <Text style={[styles.selectedTaskText, { color: colors.foreground }]} numberOfLines={1}>
                {selectedTask.title}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedTaskId(null)}>
              <IconSymbol name="xmark" size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>
        ) : incompleteTasks.length > 0 && (
          <View style={styles.taskSuggestions}>
            <Text style={[styles.suggestionsTitle, { color: colors.muted }]}>
              Vincular a uma tarefa:
            </Text>
            <View style={styles.taskChips}>
              {incompleteTasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setSelectedTaskId(task.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.taskChipText, { color: colors.foreground }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Settings hint */}
        <Text style={[styles.settingsHint, { color: colors.muted }]}>
          {settings.pomodoro.workDuration}min foco • {settings.pomodoro.shortBreakDuration}min pausa • {settings.pomodoro.sessionsUntilLongBreak} sessões até pausa longa
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  sessionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  timerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
    borderWidth: 2,
  },
  progressRing: {
    position: 'absolute',
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 32,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTask: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  selectedTaskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedTaskText: {
    flex: 1,
    fontSize: 14,
  },
  taskSuggestions: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  taskChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 150,
  },
  taskChipText: {
    fontSize: 12,
  },
  settingsHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 16,
  },
});
