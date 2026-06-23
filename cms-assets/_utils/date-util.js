import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const getSucceedingDate = () => {
  const now = new Date();

  // eslint-disable-next-line no-undef
  const auFormatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = auFormatter.formatToParts(now);

  const day = Number(parts.find((p) => p.type === 'day')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const year = Number(parts.find((p) => p.type === 'year')?.value);

  const auDate = new Date(year, month - 1, day);
  auDate.setDate(auDate.getDate() + 1);

  const nextYear = auDate.getFullYear();
  const nextMonth = String(auDate.getMonth() + 1).padStart(2, '0');
  const nextDay = String(auDate.getDate()).padStart(2, '0');

  return `${nextDay}/${nextMonth}/${nextYear}`; // DD/MM/YYYY
};

export const formatDate = (date) => {
  const [day, month, year] = date.split('/');
  return `${day}/${month}/${year}`;
};

export const formatISODate = (date) => {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

export const parseTimeToMinutes = (time) => {
  const [timeStr, period] = time.split(/(AM|PM)/);
  let [hour, minute] = timeStr.split(':').map(Number);

  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
};

export const getDayOfWeekFromDate = (date) => {
  const [day, month, year] = date.split('/');
  const formattedDate = `${year}-${month}-${day}`;
  return new Date(formattedDate).getDay();
};

export const findMostCommonTimes = (schedule) => {
  const startCount = {};
  const endCount = {};

  for (const day in schedule) {
    const entry = schedule[day];
    if (entry) {
      startCount[entry.start] = (startCount[entry.start] || 0) + 1;
      endCount[entry.end] = (endCount[entry.end] || 0) + 1;
    }
  }

  const mostCommonStart =
    Object.entries(startCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const mostCommonEnd =
    Object.entries(endCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return { mostCommonStart, mostCommonEnd };
};

export const generateOperatingHourOptions = (
  opts = {
    minDate: null,
    startTime: null,
    endTime: null,
    date: null,
    bookings: null,
    branch: null,
  },
) => {
  const { minDate, startTime, endTime, date, bookings, branch, disabled } =
    opts;
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const dateObject = getDateObjectFromDateString(date);

  const options = [];
  for (let i = start; i <= end; i += 30) {
    const hour = Math.floor(i / 60);
    const minute = i % 60;
    const formattedTime = `${hour}:${minute < 10 ? '0' + minute : minute}`;
    const timezone = branch.timezone ?? 'Australia/Melbourne';
    const dateTimeLocal = `${formatISODate(date)}T${formattedTime}`;

    const timestamp_start = dayjs.tz(dateTimeLocal, timezone).utc().valueOf();
    const timestamp_end = dayjs
      .tz(dateTimeLocal, timezone)
      .add(1, 'hour')
      .utc()
      .valueOf();

    options.push({
      id: `${branch.hs_object_id} - ${date} ${formattedTime}`,
      value: `${date} ${formattedTime}`,
      label: formattedTime,
      repairer_id: branch.repairer_id,
      company_id: branch.hs_object_id,
      booked: bookings[formattedTime] ?? 0,
      latitude: branch.latitude,
      longitude: branch.longitude,
      disabled: disabled ? disabled : dateObject < minDate,
      address: branch.address,
      street_address: branch.address2 ?? branch.address,
      place_id: branch.place_id,
      display_name: branch.display_name,
      state: branch.state,
      postcode: branch.zip,
      service_location: 'service_centre',
      timestamp_start,
      timestamp_end,
    });
  }

  options.push(
    createAtHomeTimeBand(
      branch,
      date,
      disabled ? disabled : dateObject < minDate,
    ),
  );

  return options;
};

const createAtHomeTimeBand = (branch, date, disabled) => {
  const atHomeTimeBand = `9:00 - 15:00`;
  const timezone = branch.timezone ?? 'Australia/Melbourne';

  const [startStr, endStr] = atHomeTimeBand.split(' - ');
  const startHour = parseInt(startStr.split(':')[0], 10);
  const endHour = parseInt(endStr.split(':')[0], 10);

  const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
  const endTime = `${endHour.toString().padStart(2, '0')}:00:00`;

  const startDateTimeLocal = `${formatISODate(date)}T${startTime}`;
  const endDateTimeLocal = `${formatISODate(date)}T${endTime}`;

  const at_home_timestamp_start = dayjs
    .tz(startDateTimeLocal, timezone)
    .utc()
    .valueOf();
  const at_home_timestamp_end = dayjs
    .tz(endDateTimeLocal, timezone)
    .utc()
    .valueOf();

  const option = {
    id: `${branch.hs_object_id} - ${date} ${atHomeTimeBand}`,
    value: `${date} 9:00`,
    label: atHomeTimeBand,
    repairer_id: branch.repairer_id,
    company_id: branch.hs_object_id,
    booked: 0,
    latitude: branch.latitude,
    longitude: branch.longitude,
    disabled,
    address: branch.address,
    display_name: branch.display_name,
    service_location: 'at_home',
    timestamp_start: at_home_timestamp_start,
    timestamp_end: at_home_timestamp_end,
  };

  return option;
};

export const parseCustomDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/').map(Number);
  const fullYear = year < 100 ? 2000 + year : year;
  const date = new Date(fullYear, month - 1, day); // JS months are 0-based

  const monthAbbr = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${monthAbbr[date.getMonth()]} ${day}`;
};

export const getDateObjectFromDateString = (dateString) => {
  const [maxDay, maxMonth, maxYear] = dateString.split('/');
  return new Date(`${maxYear}-${maxMonth}-${maxDay}T00:00:00+10:00`);
};

export const formatDateLong = (dateInput, fromString = false) => {
  let currentDate = dateInput;

  if (fromString) {
    currentDate = parseDate(currentDate);
  }

  const date = new Date(currentDate);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const parseDate = (str, minDate = null) => {
  const parsed = dayjs(str, 'DD/MM/YYYY H:mm', true);
  if (parsed.isValid()) return parsed.toDate();
  return minDate ? new Date(minDate) : null;
};
