
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

/**
 * Formats a task's date and time for display.
 * @param date - The date to format.
 * @param showTime - Whether to show the time in the format.
 * @returns The formatted date and time string.
 */
export function formatTaskDateAndTime(date: Date | undefined, showTime: boolean): string {
    if (!date) return "";

    // Check if this is a relative date (today, tomorrow, yesterday)
    const relativeName = getRelativeDateName(date);
    const dateDisplay = relativeName || date.toLocaleDateString();

    return dateDisplay + (showTime ? (" " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : "");
}