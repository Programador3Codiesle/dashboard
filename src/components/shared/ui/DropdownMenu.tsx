import { Portal } from "./Portal";

export interface DropdownItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    items: DropdownItem[];
    dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function DropdownMenu({ isOpen, position, items, dropdownRef }: DropdownMenuProps) {
    if (!isOpen) return null;

    return (
        <Portal>
            <div
                ref={dropdownRef}
                style={{
                    position: 'fixed',
                    top: `${position.y}px`,
                    left: `${position.x}px`,
                    zIndex: 1000,
                }}
                className="bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px] animate-fadeIn"
            >
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={item.onClick}
                        className={`
                            w-full px-4 py-2.5 text-left flex items-center gap-3
                            transition-colors duration-150
                            ${item.variant === 'danger'
                                ? 'hover:bg-red-50 text-red-600'
                                : 'hover:bg-gray-100 text-gray-700'
                            }
                        `}
                    >
                        {item.icon && <span className="shrink-0">{item.icon}</span>}
                        <span className="text-sm font-medium">{item.label}</span>
                    </button>
                ))}
            </div>
        </Portal>
    );
}
