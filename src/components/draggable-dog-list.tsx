import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { DogCard } from '@/components/dog-card';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Dog } from '@/types/dog';

// DogCard is a fixed-height row (56px avatar + Spacing.three padding top/bottom + 1px border
// on each side), so absolute-positioning rows at `index * ROW_HEIGHT` is safe/predictable.
const CARD_HEIGHT = 56 + Spacing.three * 2 + 2;
const ROW_GAP = Spacing.three;
const ROW_HEIGHT = CARD_HEIGHT + ROW_GAP;

export interface DraggableDogListProps {
  dogs: Dog[];
  onPressDog: (dog: Dog) => void;
  /** Called once, after a drag ends, with the dogs in their new display order. */
  onReorder: (dogs: Dog[]) => void;
}

/**
 * Drag-to-reorder list for the Dogs tab. Dragging is triggered from a dedicated handle icon
 * (not the row itself), so tapping the rest of the row still navigates to the dog's detail
 * screen. Built directly on react-native-gesture-handler + react-native-reanimated (already
 * project dependencies) instead of a 3rd-party sortable-list library, to avoid version
 * compatibility risk with Reanimated 4 / Expo SDK 57.
 */
export function DraggableDogList({ dogs, onPressDog, onReorder }: DraggableDogListProps) {
  const [order, setOrder] = useState(dogs);
  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const draggingIdShared = useSharedValue<string | null>(null);
  const dragTranslateY = useSharedValue(0);
  const dragStartIndex = useSharedValue(0);
  const dragCurrentIndex = useSharedValue(0);

  // Keep in sync with fresh server data (e.g. after create/delete), but never fight an
  // in-progress drag, and avoid clobbering local optimistic ordering with a stale prop list.
  useEffect(() => {
    if (draggingIdShared.value !== null) {
      return;
    }
    // Intentionally syncing local display order from the `dogs` prop (server data).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(dogs);
  }, [dogs, draggingIdShared]);

  const reorderTo = useCallback((dogId: string, newIndex: number) => {
    setOrder((prev) => {
      const fromIndex = prev.findIndex((dog) => dog.id === dogId);
      if (fromIndex === -1 || fromIndex === newIndex) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }, []);

  const commitDrag = useCallback(() => {
    onReorder(orderRef.current);
  }, [onReorder]);

  // These worklets own the actual shared-value writes. They're defined here, closing over
  // shared values created by this same component (not received as props), and handed down to
  // each row as plain callback props so rows only ever *call* them, never mutate directly.
  //
  // Note: mutating `.value` is the standard, intended API for Reanimated shared values
  // (https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary/#shared-value);
  // the react-hooks/immutability rule's generic "don't mutate hook arguments" heuristic doesn't
  // yet understand this Reanimated-specific pattern, hence the disables below.
  const startDrag = useCallback(
    (dogId: string, index: number) => {
      'worklet';
      // eslint-disable-next-line react-hooks/immutability
      draggingIdShared.value = dogId;
      // eslint-disable-next-line react-hooks/immutability
      dragStartIndex.value = index;
      // eslint-disable-next-line react-hooks/immutability
      dragCurrentIndex.value = index;
      // eslint-disable-next-line react-hooks/immutability
      dragTranslateY.value = 0;
    },
    [draggingIdShared, dragStartIndex, dragCurrentIndex, dragTranslateY]
  );

  const updateDrag = useCallback(
    (dogId: string, translationY: number, count: number) => {
      'worklet';
      // eslint-disable-next-line react-hooks/immutability
      dragTranslateY.value = translationY;
      const rawIndex = dragStartIndex.value + translationY / ROW_HEIGHT;
      const newIndex = Math.min(Math.max(Math.round(rawIndex), 0), count - 1);
      if (newIndex !== dragCurrentIndex.value) {
        // eslint-disable-next-line react-hooks/immutability
        dragCurrentIndex.value = newIndex;
        runOnJS(reorderTo)(dogId, newIndex);
      }
    },
    [dragTranslateY, dragStartIndex, dragCurrentIndex, reorderTo]
  );

  const endDrag = useCallback(() => {
    'worklet';
    // eslint-disable-next-line react-hooks/immutability
    draggingIdShared.value = null;
    runOnJS(commitDrag)();
  }, [draggingIdShared, commitDrag]);


  return (
    <View style={{ height: Math.max(order.length * ROW_HEIGHT - ROW_GAP, 0) }}>
      {order.map((dog) => {
        const index = order.findIndex((item) => item.id === dog.id);
        return (
          <DraggableDogRow
            key={dog.id}
            dog={dog}
            index={index}
            count={order.length}
            draggingIdShared={draggingIdShared}
            dragTranslateY={dragTranslateY}
            dragStartIndex={dragStartIndex}
            onStartDrag={startDrag}
            onUpdateDrag={updateDrag}
            onEndDrag={endDrag}
            onPress={() => onPressDog(dog)}
          />
        );
      })}
    </View>
  );
}

interface DraggableDogRowProps {
  dog: Dog;
  index: number;
  count: number;
  draggingIdShared: ReturnType<typeof useSharedValue<string | null>>;
  dragTranslateY: ReturnType<typeof useSharedValue<number>>;
  dragStartIndex: ReturnType<typeof useSharedValue<number>>;
  onStartDrag: (dogId: string, index: number) => void;
  onUpdateDrag: (dogId: string, translationY: number, count: number) => void;
  onEndDrag: () => void;
  onPress: () => void;
}

function DraggableDogRow({
  dog,
  index,
  count,
  draggingIdShared,
  dragTranslateY,
  dragStartIndex,
  onStartDrag,
  onUpdateDrag,
  onEndDrag,
  onPress,
}: DraggableDogRowProps) {
  const colors = useTheme();

  const panGesture = Gesture.Pan()
    .onStart(() => {
      onStartDrag(dog.id, index);
    })
    .onUpdate((event) => {
      onUpdateDrag(dog.id, event.translationY, count);
    })
    .onEnd(() => {
      onEndDrag();
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = draggingIdShared.value === dog.id;
    const translateY = isActive
      ? dragStartIndex.value * ROW_HEIGHT + dragTranslateY.value
      : withSpring(index * ROW_HEIGHT, { damping: 20, stiffness: 200 });
    return {
      transform: [{ translateY }],
      zIndex: isActive ? 1 : 0,
      shadowOpacity: isActive ? 0.15 : 0,
      shadowRadius: isActive ? 8 : 0,
      shadowOffset: { width: 0, height: isActive ? 4 : 0 },
      elevation: isActive ? 4 : 0,
    };
  }, [index]);

  return (
    <Animated.View style={[styles.row, animatedStyle]}>
      <View style={styles.cardSlot}>
        <DogCard dog={dog} onPress={onPress} />
      </View>
      <GestureDetector gesture={panGesture}>
        <View style={[styles.handle, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
          <Ionicons name="reorder-three" size={22} color={colors.textSecondary} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  cardSlot: {
    flex: 1,
  },
  handle: {
    width: CARD_HEIGHT,
    height: CARD_HEIGHT,
    borderRadius: Radii.large,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
