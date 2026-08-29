/**
 * Formats duration in seconds to a human-friendly string with combined units.
 * < 60s -> show seconds only (e.g., 52s)
 * 60s <= time < 3600s -> show minutes + seconds (e.g., 8m 52s)
 * >= 3600s -> show hours + minutes (e.g., 1h 20m)
 * @param {number} totalSeconds duration in seconds
 * @returns {string}
 */
export const formatDuration = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds <= 0) {
    return '0s';
  }

  const seconds = Math.round(totalSeconds);

  if (seconds < 60) {
    return `${seconds}s`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
};
