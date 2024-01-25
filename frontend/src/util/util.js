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
  const timestamp = Date.parse(jsonDate.date);
  const date = new Date(timestamp);

  return date;
}

export function errorToast(axiosError) {
  toast.error(getAxiosErrorMessage(axiosError));
}

export function getAxiosErrorMessage(axiosError) {
  return axiosError.response.data?.message ?? axiosError.message;
}
