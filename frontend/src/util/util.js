import { toast } from "react-toastify";

export function jsonDateToJsDate(jsonDate) {
  // jsonDate is an object with these properties:
  /*
    {
      date: string,
      timezone_type: int,
      timezone: string
    }
  */

  //After a new backend update it is now just a string
  return new Date(jsonDate);
}

export function dateToTimeAgoString(date) {
  //Output: "15 minutes ago", "2 hours ago", "3 days ago", "1 month ago", "1 year ago"

  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else if (days > 0) {
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  } else {
    return seconds === 1 ? "1 second ago" : `${seconds} seconds ago`;
  }
}

export function errorToast(axiosError) {
  toast.error(getAxiosErrorMessage(axiosError));
}

export function getAxiosErrorMessage(axiosError) {
  console.log("Axios error:", axiosError);
  return axiosError.response.data?.error ?? axiosError.message;
}

export function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}
