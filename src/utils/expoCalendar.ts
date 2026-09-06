import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

/**
 * Requests (or confirms existing) permission to read/write the device's calendars.
 * Returns whether permission is currently granted.
 */
export async function ensureCalendarPermission(): Promise<boolean> {
  const existing = await Calendar.getCalendarPermissions();
  if (existing.granted) {
    return true;
  }
  const requested = await Calendar.requestCalendarPermissions();
  return requested.granted;
}

/**
 * Finds an existing writable calendar on the device, or creates a dedicated "Dog Trainer"
 * calendar if none is writable. iOS and Android need slightly different `source` details
 * to create a new local calendar.
 */
async function getOrCreateWritableCalendar(): Promise<Calendar.ExpoCalendar> {
  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  const writable = calendars.find((calendar) => calendar.allowsModifications);
  if (writable) {
    return writable;
  }

  if (Platform.OS === 'ios') {
    const defaultCalendar = Calendar.getDefaultCalendarSync();
    return Calendar.createCalendar({
      title: 'Dog Trainer',
      color: '#2F6FED',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendar.source.id,
      source: defaultCalendar.source,
      name: 'Dog Trainer',
      ownerAccount: defaultCalendar.source.name,
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
  }

  const localSource = calendars.find((calendar) => calendar.source?.type === Calendar.SourceType.LOCAL)?.source ?? {
    isLocalAccount: true,
    name: 'Dog Trainer',
    type: Calendar.SourceType.LOCAL,
  };
  return Calendar.createCalendar({
    title: 'Dog Trainer',
    color: '#2F6FED',
    entityType: Calendar.EntityTypes.EVENT,
    source: localSource,
    name: 'Dog Trainer',
    ownerAccount: 'Dog Trainer',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

export interface AddDeviceCalendarEventInput {
  title: string;
  notes?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
}

/** Requests calendar permission (if needed), then creates an event on a writable device calendar. */
export async function addEventToDeviceCalendar(input: AddDeviceCalendarEventInput): Promise<void> {
  const granted = await ensureCalendarPermission();
  if (!granted) {
    throw new Error('Calendar permission was not granted.');
  }
  const calendar = await getOrCreateWritableCalendar();
  await calendar.createEvent({
    title: input.title,
    notes: input.notes,
    startDate: input.startDate,
    endDate: input.endDate,
    allDay: input.allDay ?? false,
  });
}
