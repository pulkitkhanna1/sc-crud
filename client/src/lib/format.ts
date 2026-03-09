export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function isPastDate(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  const todayValue = new Date();
  const compareValue = new Date(value);
  todayValue.setHours(0, 0, 0, 0);
  compareValue.setHours(0, 0, 0, 0);

  return compareValue < todayValue;
}
