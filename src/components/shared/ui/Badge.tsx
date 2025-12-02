interface BadgeProps {
    text: string | number;
    color: string;
    onHover?: (e: any) => void;
    onLeave?: () => void;
}

export function Badge({ text, color, onHover, onLeave }: BadgeProps) {
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium border cursor-help ${color}`}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            {text}
        </span>
    );
}
