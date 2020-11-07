export function getEventOfGoogleCalendar(EVENTS_OF_CALENDAR) {
  const formatDate = (date) => {
    const d = date.getDate() < 10 ? `0${date.getDate() * 1}` : date.getDate() * 1;
    const m = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const y = date.getFullYear();

    return `${d}/${m}/${y}`;
  };

  const formatHour = (date) => {
    const re = /\d\d:\d\d/gim;
    const hour = date.match(re)[0];

    return hour;
  };

  const locationExist = (location) => {
    return location;
  };

  return new Promise((resolve, reject) => {
    const listOfEventsCalendar = EVENTS_OF_CALENDAR.map((e) => {
      const data = formatDate(new Date(e.start.dateTime));
      const startTime = formatHour(e.start.dateTime);
      const endTime = formatHour(e.end.dateTime);
      const location = locationExist(e.location);

      return {
        startTime,
        endTime,
        data,
        description: e.summary,
        location,
      };
    });
    resolve(listOfEventsCalendar);
  });
}
