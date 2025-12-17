import { useState, useCallback } from "react";
import { IUsuario } from "../../../../modules/usuarios/types";

type ModalAction = 'delete' | 'toggle-status';

export function useConfirmModal() {
    const [modal, setModal] = useState<{
        open: boolean;
        usuario: IUsuario | null;
        action: ModalAction | null;
    }>({
        open: false,
        usuario: null,
        action: null
    });

    const openModal = useCallback((usuario: IUsuario | null, action: ModalAction = 'delete') => {
        setModal({ open: true, usuario, action });
    }, []);

    const closeModal = useCallback(() => {
        setModal({ open: false, usuario: null, action: null });
    }, []);

    return {
        modal,
        openModal,
        closeModal
    };
}
