import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sessionsApi } from '@/api/sessions';
import type {
  AddSessionExercisePayload,
  CreateTrainingSessionPayload,
  UpdateSessionExercisePayload,
  UpdateTrainingSessionPayload,
} from '@/types/session';

const dogSessionsKey = (dogId: string) => ['dogs', dogId, 'training-sessions'] as const;
const sessionKey = (id: string) => ['training-sessions', id] as const;

export function useDogSessions(dogId: string | undefined) {
  return useQuery({
    queryKey: dogSessionsKey(dogId ?? ''),
    queryFn: () => sessionsApi.listForDog(dogId as string),
    enabled: !!dogId,
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: sessionKey(id ?? ''),
    queryFn: () => sessionsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCreateSession(dogId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTrainingSessionPayload) => sessionsApi.create(dogId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dogSessionsKey(dogId) });
    },
  });
}

export function useUpdateSession(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTrainingSessionPayload) => sessionsApi.update(id, payload),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey(id), session);
      queryClient.invalidateQueries({ queryKey: dogSessionsKey(session.dogId) });
    },
  });
}

export function useCompleteSession(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sessionsApi.complete(id),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey(id), session);
      queryClient.invalidateQueries({ queryKey: dogSessionsKey(session.dogId) });
    },
  });
}

export function useCancelSession(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sessionsApi.cancel(id),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey(id), session);
      queryClient.invalidateQueries({ queryKey: dogSessionsKey(session.dogId) });
    },
  });
}

export function useAddSessionExercise(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddSessionExercisePayload) => sessionsApi.addExercise(sessionId, payload),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey(sessionId), session);
    },
  });
}

export function useUpdateSessionExercise(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, payload }: { exerciseId: string; payload: UpdateSessionExercisePayload }) =>
      sessionsApi.updateExercise(sessionId, exerciseId, payload),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey(sessionId), session);
    },
  });
}

export function useRemoveSessionExercise(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (exerciseId: string) => sessionsApi.removeExercise(sessionId, exerciseId),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey(sessionId), session);
    },
  });
}
