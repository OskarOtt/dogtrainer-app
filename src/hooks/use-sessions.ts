import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { sessionsApi } from '@/api/sessions';
import { dogsApi } from '@/api/dogs';
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

/**
 * Finds sessions the user may have navigated away from mid-training. There's no backend
 * endpoint to list in-progress sessions across all dogs, so this fetches each dog's session
 * list client-side and filters to IN_PROGRESS — fine for the small number of dogs a user
 * typically has. Used by the Train tab to offer a "Resume Session" shortcut.
 */
export function useInProgressSessions() {
  const { data: dogs, isLoading: isLoadingDogs } = useQuery({
    queryKey: ['dogs'] as const,
    queryFn: dogsApi.list,
  });

  const sessionQueries = useQueries({
    queries: (dogs ?? []).map((dog) => ({
      queryKey: dogSessionsKey(dog.id),
      queryFn: () => sessionsApi.listForDog(dog.id),
      enabled: !!dogs,
    })),
  });

  const isLoading = isLoadingDogs || sessionQueries.some((query) => query.isLoading);
  const inProgressSessions = (dogs ?? []).flatMap((dog, index) => {
    const sessions = sessionQueries[index]?.data ?? [];
    return sessions
      .filter((session) => session.status === 'IN_PROGRESS')
      .map((session) => ({ session, dog }));
  });

  return { data: inProgressSessions, isLoading };
}

/**
 * Fetches every dog's sessions client-side and flattens them into a single list, each
 * paired with its owning dog. There's no backend endpoint to list sessions across all
 * dogs, so this mirrors useInProgressSessions — fine for the small number of dogs a user
 * typically has. Used by the Calendar tab/day view to aggregate completed trainings.
 */
export function useAllSessions() {
  const { data: dogs, isLoading: isLoadingDogs } = useQuery({
    queryKey: ['dogs'] as const,
    queryFn: dogsApi.list,
  });

  const sessionQueries = useQueries({
    queries: (dogs ?? []).map((dog) => ({
      queryKey: dogSessionsKey(dog.id),
      queryFn: () => sessionsApi.listForDog(dog.id),
      enabled: !!dogs,
    })),
  });

  const isLoading = isLoadingDogs || sessionQueries.some((query) => query.isLoading);
  const isError = sessionQueries.some((query) => query.isError);
  const sessions = (dogs ?? []).flatMap((dog, index) => {
    const dogSessions = sessionQueries[index]?.data ?? [];
    return dogSessions.map((session) => ({ session, dog }));
  });

  return { data: sessions, isLoading, isError };
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
