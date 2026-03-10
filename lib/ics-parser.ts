export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
}

export function parseICS(icsData: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsData.split(/\r?\n/);
  let currentEvent: Partial<CalendarEvent> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.title && currentEvent.start && currentEvent.end) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith('DTSTART:')) {
        currentEvent.start = parseICSDate(line.substring(8));
      } else if (line.startsWith('DTEND:')) {
        currentEvent.end = parseICSDate(line.substring(6));
      }
    }
  }

  return events;
}

function parseICSDate(icsDate: string): Date {
  // Format: YYYYMMDDTHHMMSSZ or YYYYMMDD
  const year = parseInt(icsDate.substring(0, 4));
  const month = parseInt(icsDate.substring(4, 6)) - 1;
  const day = parseInt(icsDate.substring(6, 8));
  
  const date = new Date(year, month, day);
  
  if (icsDate.includes('T')) {
    const timePos = icsDate.indexOf('T') + 1;
    const hour = parseInt(icsDate.substring(timePos, timePos + 2));
    const minute = parseInt(icsDate.substring(timePos + 2, timePos + 4));
    const second = parseInt(icsDate.substring(timePos + 4, timePos + 6));
    date.setHours(hour, minute, second);
  }
  
  return date;
}
