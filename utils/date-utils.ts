
/**
 * Gets the relative date name if the date is today, tomorrow, or yesterday
 * @param date - The date to check
 * @returns "today", "tomorrow", "yesterday", or null if not a relative date
 */
function getRelativeDateName(date: Date): string | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const diffTime = checkDate.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";

    return null;
}

export function formatTaskDateAndTime(dateString: string | undefined, timeString: string | undefined): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const time = new Date(dateString + "T" + timeString);

    // Check if this is a relative date (today, tomorrow, yesterday)
    const relativeName = getRelativeDateName(date);
    const dateDisplay = relativeName || date.toLocaleDateString();

    return dateDisplay + (timeString ? (" " + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : "");
}

export function convertFromUtcToLocal(dateString: string, timeString: string): { localDateString: string, localTimeString: string } {
    const utcDate = new Date(dateString + "T" + timeString); // Treat as UTC
    const localDateString = utcDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const localTimeString = utcDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
    return { localDateString, localTimeString };
}

export function convertFromLocalToUtc(dateString: string, timeString: string): { utcDateString: string, utcTimeString: string } {
    const localDate = new Date(dateString + "T" + timeString);
    const utcDate = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000));
    const utcDateString = utcDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const utcTimeString = utcDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
    return { utcDateString, utcTimeString };
}
export function convertUtcTimeToLocalDate(utcIsoTimeString: string): Date {
    // utcIsoTimeString should be in format "HH:mm:ss" or "HH:mm:ssZ" or "HH:mm"
    const now = new Date();

    const [hours, minutes, seconds] = utcIsoTimeString.replace('Z', '').split(':').map(Number);
    const localDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds || 0, 0));

    return localDate;
}