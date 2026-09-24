import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';
import { FormTextInput } from '@/components/form-text-input';
import { KeyboardAwareView } from '@/components/keyboard-aware-layout';
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

const REPORT_REASON_LABELS: Record<ReportReason, TranslationKey> = {
  Spam: 'posts.reportReasons.spam',
  'Inappropriate content': 'posts.reportReasons.inappropriate',
  'Harassment or bullying': 'posts.reportReasons.harassment',
  'Animal welfare concern': 'posts.reportReasons.welfare',
  Other: 'posts.reportReasons.other',
};

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
    Alert.alert(t('social.blockUserTitle', { name: authorName }), t('social.blockMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.block'), style: 'destructive', onPress: () => blockUser.mutate(authorId) },
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAwareView style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title}>
              {step === 'menu' ? t('posts.options') : step === 'report' ? t('posts.reportPost') : t('posts.reportThanks')}
            </ThemedText>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {step === 'menu' ? (
            <View style={styles.menu}>
              <Pressable style={styles.menuRow} onPress={() => setStep('report')}>
                <Ionicons name="flag-outline" size={18} color={colors.text} />
                <ThemedText>{t('posts.reportPost')}</ThemedText>
              </Pressable>
              <Pressable style={styles.menuRow} onPress={handleBlock}>
                <Ionicons name="ban-outline" size={18} color={colors.danger} />
                <ThemedText themeColor="danger">{t('posts.blockAuthor', { name: authorName })}</ThemedText>
              </Pressable>
            </View>
          ) : null}

          {step === 'report' ? (
            <View style={styles.reportForm}>
              {REPORT_REASONS.map((option) => {
                const selected = option === reason;
                return (
                  <Pressable
                    key=                    {t(REPORT_REASON_LABELS[option])}
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
                placeholder={t('posts.reportDetails')}
                multiline
              />

              {createReport.isError ? (
                <ThemedText themeColor="danger" style={styles.message}>
                  {getApiErrorMessage(createReport.error, t('posts.reportError'))}
                </ThemedText>
              ) : null}

              <PrimaryButton
                title={t('posts.reportSubmit')}
                onPress={handleSubmitReport}
                loading={createReport.isPending}
                disabled={!reason}
              />
            </View>
          ) : null}

          {step === 'done' ? (
            <View style={styles.doneState}>
              <ThemedText themeColor="textSecondary">{t('posts.reportReceived')}</ThemedText>
              <PrimaryButton title={t('common.close')} variant="secondary" onPress={handleClose} />
            </View>
          ) : null}
        </SafeAreaView>
      </KeyboardAwareView>
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
