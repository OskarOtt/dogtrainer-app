import { StyleSheet } from 'react-native';
import DraggableFlatList, { type RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import { DogCard } from '@/components/dog-card';
import { BottomTabInset, Spacing } from '@/constants/theme';
import type { Dog } from '@/types/dog';

export interface DraggableDogListProps {
  dogs: Dog[];
  onPressDog: (dog: Dog) => void;
  /** Called once, after a drag ends, with the dogs in their new display order. */
  onReorder: (dogs: Dog[]) => void;
}

/**
 * Drag-to-reorder list for the Dogs tab, built on react-native-draggable-flatlist. There's no
 * separate handle: press and hold anywhere on a dog's card to pick it up and drag it to a new
 * position, while a quick tap still navigates to the dog's detail screen.
 */
export function DraggableDogList({ dogs, onPressDog, onReorder }: DraggableDogListProps) {
  const renderItem = ({ item, drag, isActive }: RenderItemParams<Dog>) => (
    <ScaleDecorator>
      <DogCard dog={item} onPress={() => onPressDog(item)} onLongPress={drag} disabled={isActive} />
    </ScaleDecorator>
  );

  return (
    <DraggableFlatList
      data={dogs}
      keyExtractor={(dog) => dog.id}
      renderItem={renderItem}
      onDragEnd={({ data }) => onReorder(data)}
      containerStyle={styles.flatList}
      style={styles.flatList}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.three + BottomTabInset,
  },
});
