"use client";

import { useState } from "react";

export function CSVUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [campaign, setCampaign] = useState("");
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);
        if (campaign.trim()) {
            formData.append("campaign", campaign.trim());
        }

        try {
            const res = await fetch("/api/admin/promo-codes/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            setResult(data);
            setFile(null);
            setCampaign("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Upload Promo Codes</h3>

            <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                    />
                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                        <p className="font-semibold">CSV Format:</p>
                        <p>
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                code,expiresAt,maxUses,campaign
                            </code>
                        </p>
                        <p className="text-gray-400">
                            • code (required) • expiresAt (optional, ISO 8601)
                        </p>
                        <p className="text-gray-400">
                            • maxUses (optional, default: 1) • campaign
                            (optional)
                        </p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Campaign Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={campaign}
                        onChange={(e) => setCampaign(e.target.value)}
                        placeholder="e.g., summer_sale_2024"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Overrides campaign column in CSV if specified
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? "Uploading..." : "Upload CSV"}
                </button>
            </form>

            {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    ❌ {error}
                </div>
            )}

            {result && (
                <div className="mt-4 space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm">
                        <p className="font-semibold">✅ Import successful!</p>
                        <div className="mt-2 space-y-1">
                            <p>
                                <span className="font-medium">Imported:</span>{" "}
                                {result.imported}
                            </p>
                            <p>
                                <span className="font-medium">Duplicates:</span>{" "}
                                {result.duplicates}
                            </p>
                            {result.expired > 0 && (
                                <p className="text-orange-600 dark:text-orange-400">
                                    <span className="font-medium">
                                        Expired:
                                    </span>{" "}
                                    {result.expired}
                                </p>
                            )}
                            <p className="text-xs mt-2 text-gray-500">
                                Batch ID: {result.batchId}
                            </p>
                        </div>
                    </div>

                    {result.warnings && result.warnings.length > 0 && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm">
                            <p className="font-semibold mb-2">⚠️ Warnings:</p>
                            <ul className="list-disc list-inside space-y-1">
                                {result.warnings.map(
                                    (warning: string, i: number) => (
                                        <li key={i} className="text-xs">
                                            {warning}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
