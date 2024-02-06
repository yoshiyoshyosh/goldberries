import { CustomModal, ModalButtons, useModal } from "../hooks/useModal";

export function GenericDeleteModal({ openRef, onClose, title, actions, children }) {
  const modal = useModal(null, onClose);
  openRef.current = modal.open;

  const buttons = actions ?? [ModalButtons.Cancel, ModalButtons.Delete];

  return (
    <CustomModal modalHook={modal} options={{ title: title }} actions={buttons}>
      {children}
    </CustomModal>
  );
}
