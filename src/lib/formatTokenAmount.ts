import { formatUnits } from "viem";

/**
 * Format token amount from smallest units to human-readable NRWD
 * @param amount - Amount in smallest units (wei)
 * @param decimals - Token decimals (default 18)
 * @returns Formatted string with proper singular/plural
 */
export function formatTokenAmount(
    amount: string | bigint,
    decimals: number = 18,
): string {
    const formatted = formatUnits(BigInt(amount), decimals);
    const numericValue = parseFloat(formatted);

    // Add thousand separators
    const formattedWithCommas = numericValue.toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });

    // Handle singular/plural
    if (numericValue === 1) {
        return `${formattedWithCommas} NRWD token`;
    }
    return `${formattedWithCommas} NRWD tokens`;
}

/**
 * Format token amount for display (just the number with commas)
 * @param amount - Amount in smallest units (wei)
 * @param decimals - Token decimals (default 18)
 * @returns Formatted number string
 */
export function formatTokenNumber(
    amount: string | bigint,
    decimals: number = 18,
): string {
    const formatted = formatUnits(BigInt(amount), decimals);
    const numericValue = parseFloat(formatted);

    return numericValue.toLocaleString("en-US", {
        maximumFractionDigits: 0,
    });
}
