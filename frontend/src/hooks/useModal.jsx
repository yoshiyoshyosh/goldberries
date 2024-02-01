import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";

export function useModal(defaultData, onClose, options = { onOpen: undefined, actions: undefined }) {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState(defaultData);
  const [storedTitle] = useState(document.title);

  const open = (data) => {
    if (data !== undefined) setData(data);
    const onOpen = options?.onOpen;
    if (typeof onOpen === "function") onOpen(data);
    setIsVisible(true);
  };
  const close = (cancelled = false, newData = undefined) => {
    let ret = typeof onClose === "function" ? onClose(cancelled, newData ?? data) : true;
    if (ret !== false) {
      setIsVisible(false);
      document.title = storedTitle;
    }
  };
  const cancel = () => close(true);

  return { isVisible, data, setData, open, close, cancel, options };
}

export function CustomModal({ modalHook, maxWidth = "sm", actions, children, options }) {
  const { isVisible, close, cancel } = modalHook;

  let title = options?.title ?? null;
  let hideFooter = options?.hideFooter ?? false;
  let buttons = actions ?? modalHook.options?.actions ?? [];
  //buttons = [{text, variant, color, onClick, close = true, cancel = false}]

  return (
    <Dialog
      onClose={cancel}
      open={isVisible}
      maxWidth={maxWidth}
      fullWidth
      disableScrollLock
      disableRestoreFocus
    >
      {title !== null ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent dividers>{children}</DialogContent>
      {hideFooter ? null : (
        <DialogActions>
          {buttons.map((button, i) => (
            <Button
              variant={button.variant}
              color={button.color}
              key={i}
              onClick={() => {
                if (button.onClick) button.onClick();
                if (button.close) close();
                else if (button.cancel) cancel();
              }}
            >
              {button.text}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
}

export const ModalButtons = {
  Delete: {
    text: "Delete",
    variant: "contained",
    color: "error",
    close: true,
  },
  Cancel: {
    text: "Cancel",
    variant: "outlined",
    color: "primary",
    close: false,
    cancel: true,
  },
  Save: {
    text: "Save",
    variant: "contained",
    color: "primary",
    close: true,
  },
  Close: {
    text: "Close",
    variant: "outlined",
    color: "primary",
    close: true,
  },
  Update: {
    text: "Update",
    variant: "contained",
    color: "primary",
    close: true,
  },
};
