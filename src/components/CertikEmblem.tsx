"use client";

import Script from "next/script";

export function CertikEmblem() {
    return (
        <div className="flex items-center">
            <div className="certik-emblem" data-id="9fcf073b">
                <a
                    href="https://skynet.certik.com/projects/nossa?utm_source=SkyEmblem&utm_campaign=nossa&utm_medium=link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View project at certik.com
                </a>
            </div>
            <Script
                async
                src="https://emblem.certik-assets.com/script?pid=nossa&vid=9fcf073b"
                strategy="afterInteractive"
            />
        </div>
    );
}
