import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormTextInput } from '@/components/form-text-input';
import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useBlockUser } from '@/hooks/use-users';
import { useCreateReport } from '@/hooks/use-reports';
import { useTheme } from '@/hooks/use-theme';
import { REPORT_REASONS, type ReportReason } from '@/types/report';
import { getApiErrorMessage } from '@/utils/apiError';

export interface ReportPostSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  authorId: string;
  authorName: string;
}

type Step = 'menu' | 'report' | 'done';

/**
 * Compact "..." sheet on a post, deliberately kept tiny per Apple's UGC guidelines: report a
 * post (persisted for manual review — there's no moderation UI yet) or block its author
 * (removes any existing follow both ways and hides their content going forward).
 */
export function ReportPostSheet({ visible, onClose, postId, authorId, authorName }: ReportPostSheetProps) {
  const colors = useTheme();
  const createReport = useCreateReport();
  const blockUser = useBlockUser();
  const [step, setStep] = useState<Step>('menu');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  function reset() {
    setStep('menu');
    setReason(null);
    setDetails('');
    createReport.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmitReport() {
    if (!reason) {
      return;
    }
    createReport.mutate(
      { postId, reportedUserId: authorId, reason, details: details.trim() || undefined },
      { onSuccess: () => setStep('done') },
    );
  }

  function handleBlock() {
    handleClose();
    Alert.alert(`Block ${authorName}?`, "You won't see each other's posts and you'll stop following each other.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: () => blockUser.mutate(authorId) },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {step === 'menu' ? 'Post options' : step === 'report' ? 'Report post' : 'Thanks'}
            </ThemedText>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {step === 'menu' ? (
            <View style={styles.menu}>
              <Pressable style={styles.menuRow} onPress={() => setStep('report')}>
                <Ionicons name="flag-outline" size={18} color={colors.text} />
                <ThemedText>Report post</ThemedText>
              </Pressable>
              <Pressable style={styles.menuRow} onPress={handleBlock}>
                <Ionicons name="ban-outline" size={18} color={colors.danger} />
                <ThemedText themeColor="danger">Block {authorName}</ThemedText>
              </Pressable>
            </View>
          ) : null}

          {step === 'report' ? (
            <View style={styles.reportForm}>
              {REPORT_REASONS.map((option) => {
                const selected = option === reason;
                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.reasonRow,
                      { borderColor: selected ? colors.primary : colors.border, backgroundColor: colors.background },
                    ]}
                    onPress={() => setReason(option)}
                  >
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={selected ? colors.primary : colors.textSecondary}
                    />
                    <ThemedText>{option}</ThemedText>
                  </Pressable>
                );
              })}

              <FormTextInput
                defaultValue={details}
                onChangeText={setDetails}
                placeholder="Add details (optional)"
                multiline
              />

              {createReport.isError ? (
                <ThemedText themeColor="danger" style={styles.message}>
                  {getApiErrorMessage(createReport.error, 'Could not submit this report.')}
                </ThemedText>
              ) : null}

              <PrimaryButton
                title="Submit report"
                onPress={handleSubmitReport}
                loading={createReport.isPending}
                disabled={!reason}
              />
            </View>
          ) : null}

          {step === 'done' ? (
            <View style={styles.doneState}>
              <ThemedText themeColor="textSecondary">We&apos;ve received your report and will review it.</ThemedText>
              <PrimaryButton title="Close" variant="secondary" onPress={handleClose} />
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 18 },
  menu: { gap: Spacing.one },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  reportForm: { gap: Spacing.two },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: Radii.medium,
  },
  message: { fontSize: 14 },
  doneState: { gap: Spacing.three, alignItems: 'center' },
});
