import React, { useEffect, useState } from "react";
const { ipcRenderer } = require("electron");

const useIpcEvents = ({ initValue, event, callback }) => {
  const [value, setValue] = useState(initValue);
  useEffect(() => {
    if (!callback)
      ipcRenderer.on(event, (event, data) => {
        alert(data);
        setValue(data);
      });
    else ipcRenderer.on(event, callback);
  }, []);

  return [value, setValue];
};

export default useIpcEvents;
