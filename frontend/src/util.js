const msToHoursMinutesSeconds = (totalMs) => {
    const totalSeconds = Math.floor(totalMs / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / (60 * 60));
    if (isNaN(seconds) || isNaN(minutes) || isNaN(hours)) {
        return "Not Available";
    }
    return `${hours}h ${minutes}m ${seconds}s`;
};

const msToTimeString = (ms) => {
    const date = new Date(ms);
    const currentDate = new Date();
    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const daysSinceStart = Math.floor((currentDate.getTime() - date.getTime()) / millisecondsInADay);

    if (daysSinceStart === 0) {
        return date.toLocaleTimeString(navigator.language, {
            hour: "2-digit",
            minute:"2-digit"
        });
    } else if (daysSinceStart === 1) {
        return "Yesterday";
    } else if (daysSinceStart < 7) {
        return `${daysSinceStart} days ago`;
    }

    return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
};

export {msToHoursMinutesSeconds, msToTimeString};
