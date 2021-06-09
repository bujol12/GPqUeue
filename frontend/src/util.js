const secondsToHoursMinutesSeconds = (totalSeconds) => {
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    if (isNaN(seconds) || isNaN(minutes) || isNaN(hours)) {
        return "Not Available";
    }
    return `${hours}h ${minutes}m ${seconds}s`;
};

export {secondsToHoursMinutesSeconds};
