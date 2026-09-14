'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

export type MttoPreventivoCalendarEvent = {
  id: string;
  title: string;
  start: string;
  allDay: true;
  backgroundColor?: string;
  borderColor?: string;
};

export function MttoPreventivoCalendar({
  events,
  onEventClick,
}: {
  events: MttoPreventivoCalendarEvent[];
  onEventClick: (id: string) => void;
}) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      locale={esLocale}
      aspectRatio={1.8}
      handleWindowResize
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listWeek',
      }}
      events={events}
      eventClick={(arg) => {
        onEventClick(arg.event.id);
      }}
    />
  );
}
