import { useEffect } from "react";
import Router from "next/router";
import { useBeforeUnload } from "react-use";

export const useLeavePageConfirm = (
  isConfirm = true,
  message = "Changes not saved, are you sure to leave this page?"
) => {
  useBeforeUnload(isConfirm, message);

  useEffect(() => {
    const handler = () => {
      if (isConfirm && !window.confirm(message)) {
        throw "Route Canceled";
      }
    };

    Router.events.on("routeChangeStart", handler);

    return () => {
      Router.events.off("routeChangeStart", handler);
    };
  }, [isConfirm, message]);
};