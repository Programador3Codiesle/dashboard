import { useState } from "react";

export function useTooltip() {
    const [tooltip, setTooltip] = useState<{
        show: boolean;
        x: number;
        y: number;
        content: React.ReactNode;
    } | null>(null);

    const showTooltip = (e: any, content: React.ReactNode) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            show: true,
            x: rect.left + rect.width / 2,
            y: rect.top,
            content
        });
    };

    const hideTooltip = () => setTooltip(null);

    return { tooltip, showTooltip, hideTooltip };
}
