import { useEffect, useState } from "react";

const usePageLeave = (cb) => {
  const onMouseOut = (event) => {
    event = event ? event : (window.event as any);
    const from = event.relatedTarget || event.toElement;
    if (!from || (from as any).nodeName === "HTML") {
      cb();
    }
  };

  useEffect(() => {
    document.addEventListener("mouseout", onMouseOut);
    return () => {
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);
};

export default usePageLeave;