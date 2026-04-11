import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ThoughtRecord } from '../../models/ThoughtRecord';
import { Colors, Typography, Spacing } from '../../theme';

interface ThoughtRecordCardProps {
  record: ThoughtRecord;
  onPress?: () => void;
}

export function ThoughtRecordCard({ record, onPress }: ThoughtRecordCardProps) {
  const date = new Date(record.date);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const emotionChips = record.emotions?.slice(0, 3) || [];
  const distortionChips = record.cognitive_distortions?.slice(0, 2) || [];
  const hasAI = !!record.ai_suggested_response;
  const situationPreview = record.situation?.substring(0, 80) || record.automatic_thoughts?.substring(0, 80) || '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {/* Top Row: Date + Format Badge */}
      <View style={styles.topRow}>
        <View style={styles.dateRow}>
          <Icon name="file-text" size={14} color={Colors.purple} />
          <Text style={styles.dateText}>{dateStr} · {timeStr}</Text>
        </View>
        <View style={styles.badges}>
          <View style={styles.formatBadge}>
            <Text style={styles.formatText}>{record.format?.toUpperCase() || '5COL'}</Text>
          </View>
          {hasAI && (
            <View style={styles.aiBadge}>
              <Icon name="cpu" size={10} color={Colors.purple} />
              <Text style={styles.aiText}>AI</Text>
            </View>
          )}
        </View>
      </View>

      {/* Situation Preview */}
      {situationPreview ? (
        <Text style={styles.preview} numberOfLines={2}>
          "{situationPreview}{situationPreview.length >= 80 ? '…' : ''}"
        </Text>
      ) : null}

      {/* Emotions Row */}
      {emotionChips.length > 0 && (
        <View style={styles.chipRow}>
          {emotionChips.map(e => (
            <View key={e.name} style={styles.emotionChip}>
              <Text style={styles.emotionText}>{e.name}</Text>
            </View>
          ))}
          {record.emotions?.length > 3 && (
            <Text style={styles.moreText}>+{record.emotions.length - 3}</Text>
          )}
        </View>
      )}

      {/* Distortions Row */}
      {distortionChips.length > 0 && (
        <View style={styles.chipRow}>
          {distortionChips.map(d => (
            <View key={d} style={styles.distortionChip}>
              <Icon name="alert-triangle" size={10} color={Colors.amber} />
              <Text style={styles.distortionText}>{d}</Text>
            </View>
          ))}
          {record.cognitive_distortions?.length > 2 && (
            <Text style={styles.moreText}>+{record.cognitive_distortions.length - 2}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.m,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  formatBadge: {
    backgroundColor: Colors.brandLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  formatText: {
    ...Typography.micro,
    color: Colors.brand,
    fontSize: 9,
    fontWeight: '800',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.purpleLight,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  aiText: {
    ...Typography.micro,
    color: Colors.purple,
    fontSize: 9,
    fontWeight: '800',
  },
  preview: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  emotionChip: {
    backgroundColor: Colors.brandLight,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  emotionText: {
    ...Typography.micro,
    color: Colors.brand,
    fontWeight: '700',
    fontSize: 10,
  },
  distortionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.amberLight,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  distortionText: {
    ...Typography.micro,
    color: Colors.amber,
    fontWeight: '700',
    fontSize: 10,
  },
  moreText: {
    ...Typography.micro,
    color: Colors.textTertiary,
    fontWeight: '700',
    fontSize: 10,
  },
});
