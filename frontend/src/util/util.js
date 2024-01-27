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

export function errorToast(axiosError) {
  toast.error(getAxiosErrorMessage(axiosError));
}

export function getAxiosErrorMessage(axiosError) {
  console.log("Axios error:", axiosError);
  return axiosError.response.data?.error ?? axiosError.message;
}
