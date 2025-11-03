/**
 * Safely converts a timestamp of any format to a Date object
 * Handles Firestore timestamps, strings, numbers, and objects
 */
export const safeConvertToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date();
  }
  
  // If it's a Firestore Timestamp object with toDate method
  if (timestamp && typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate();
    } catch (e) {
      console.warn('Error converting Firestore timestamp:', e);
      return new Date();
    }
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    // Validate the date is valid
    if (isNaN(timestamp.getTime())) {
      console.warn('Invalid Date object provided, using current date');
      return new Date();
    }
    return timestamp;
  }
  
  // If it's a number (milliseconds or seconds)
  if (typeof timestamp === 'number') {
    // Handle seconds timestamp (convert to milliseconds)
    const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
    try {
      const date = new Date(ms);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.warn('Error converting number timestamp:', e);
    }
  }
  
  // If it's a string, try to parse it
  if (typeof timestamp === 'string') {
    try {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.warn('Error parsing string timestamp:', e);
    }
  }
  
  // If it's an object with seconds/nanoseconds (Firestore format)
  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    try {
      const ms = timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
      const date = new Date(ms);
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (e) {
      console.warn('Error converting Firestore timestamp object:', e);
    }
  }
  
  // Fallback to current date if all else fails
  console.warn('Could not convert timestamp to Date, using current date:', timestamp);
  return new Date();
};

