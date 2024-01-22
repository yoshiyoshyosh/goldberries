import { useCallback, useState, useEffect } from "react";

export function useLocalStorage(key, defaultValue) {
  return useStorage(key, defaultValue, window.localStorage);
}

export function useSessionStorage(key, defaultValue) {
  return useStorage(key, defaultValue, window.sessionStorage);
}

function useStorage(key, defaultValue, storageObject) {
  const [value, setValue] = useState(() => {
    const jsonValue = storageObject.getItem(key);
    if (jsonValue != null) return JSON.parse(jsonValue);

    if (typeof defaultValue === "function") {
      return defaultValue();
    } else {
      return defaultValue;
    }
  });

  // useEffect(() => {
  //   console.log("useStorage: useEffect updating value -> ", value);
  //   if (value === undefined) return storageObject.removeItem(key);
  //   storageObject.setItem(key, JSON.stringify(value));
  // }, [key, value, storageObject]);

  const updateValue = (newValue) => {
    if (newValue === undefined) storageObject.removeItem(key);
    else storageObject.setItem(key, JSON.stringify(newValue));
    setValue(newValue);
  };

  const remove = useCallback(() => {
    setValue(undefined);
  }, []);

  return [value, updateValue, remove];
}
