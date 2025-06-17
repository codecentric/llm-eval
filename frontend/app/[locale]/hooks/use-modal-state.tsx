import { useCallback, useState } from "react";
export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const onOpen = useCallback(() => {
    setIsOpen(true);
  }, []);
  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);
  return { isOpen, onOpen, onClose };
}
