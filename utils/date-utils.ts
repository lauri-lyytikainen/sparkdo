
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