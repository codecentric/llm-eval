import { useEffect, useState } from "react";

export const Cancel = Symbol("Cancel recursive timeout.");

type ActionResult = number | unknown | typeof Cancel;

export const useRecursiveTimeout = (
  initialTimeout: number | undefined,
  action?: () => Promise<ActionResult> | ActionResult,
  disabled?: boolean,
) => {
  const [triggerAt, setTriggerAt] = useState(
    initialTimeout ? Date.now() + initialTimeout : undefined,
  );

  useEffect(() => {
    if (initialTimeout && triggerAt && action && !disabled) {
      const callback = async () => {
        const newExpiresIn = await action();

        if (newExpiresIn === Cancel) {
          setTriggerAt(undefined);
          return;
        }

        const newTriggerAt =
          Date.now() +
          (typeof newExpiresIn === "number" ? newExpiresIn : initialTimeout);

        setTriggerAt(newTriggerAt);
      };

      const timeoutRef = setTimeout(
        callback,
        Math.max(0, triggerAt - Date.now()),
      );
      return () => clearTimeout(timeoutRef);
    }
  }, [initialTimeout, triggerAt, action, disabled]);
};
