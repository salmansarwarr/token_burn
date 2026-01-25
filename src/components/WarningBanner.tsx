"use client";

interface WarningBannerProps {
    title?: string;
    message: string;
    type?: "warning" | "danger" | "info";
    icon?: string;
}

export function WarningBanner({
    title,
    message,
    type = "warning",
    icon,
}: WarningBannerProps) {
    const styles = {
        warning: {
            container:
                "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600",
            title: "text-yellow-900 dark:text-yellow-200",
            message: "text-yellow-800 dark:text-yellow-300",
            defaultIcon: "⚠️",
        },
        danger: {
            container:
                "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600",
            title: "text-red-900 dark:text-red-200",
            message: "text-red-800 dark:text-red-300",
            defaultIcon: "🚨",
        },
        info: {
            container:
                "bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600",
            title: "text-blue-900 dark:text-blue-200",
            message: "text-blue-800 dark:text-blue-300",
            defaultIcon: "ℹ️",
        },
    };

    const style = styles[type];
    const displayIcon = icon || style.defaultIcon;

    return (
        <div
            className={`${style.container} border-2 rounded-xl p-4 flex gap-3`}
        >
            <div className="text-2xl flex-shrink-0">{displayIcon}</div>
            <div className="flex-1">
                {title && (
                    <h3 className={`font-bold ${style.title} mb-1`}>{title}</h3>
                )}
                <p className={`text-sm ${style.message}`}>{message}</p>
            </div>
        </div>
    );
}
