export default new Intl.DateTimeFormat(navigator.language, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
export const hebrewDayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];


export const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const dayName = hebrewDayNames[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return { dayName, day, month };
};

export const dateRangeBuilder = (startDate: Date, endDate: Date) => {
  const dates = []
  let current = new Date(startDate);
  while (current <= endDate) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;

}