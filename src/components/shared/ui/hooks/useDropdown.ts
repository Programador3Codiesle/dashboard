import { useState, useEffect, useRef } from "react";

export function useDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);

    const openDropdown = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition({
            x: rect.left,
            y: rect.bottom + 5
        });
        setIsOpen(true);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return {
        isOpen,
        position,
        openDropdown,
        closeDropdown,
        dropdownRef
    };
}
