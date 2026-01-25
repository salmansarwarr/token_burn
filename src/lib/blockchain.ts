import {
    createPublicClient,
    http,
    parseAbi,
    type Address,
    type Hash,
    decodeEventLog
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { config } from "./config";

// ERC-20 ABI for balance and burn functions
const erc20Abi = parseAbi([
    "function balanceOf(address owner) view returns (uint256)",
    "function burn(uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

/**
 * Get the appropriate chain configuration
 */
function getChain() {
    return config.tokenContract.chainId === 1 ? mainnet : sepolia;
}

/**
 * Create public client for blockchain interactions
 */
export function getPublicClient() {
    const chain = getChain();
    const rpcUrl = chain.id === 1 ? config.rpc.mainnet : config.rpc.testnet;

    return createPublicClient({
        chain,
        transport: http(rpcUrl),
    });
}

/**
 * Get ERC-20 token balance for an address
 */
export async function getTokenBalance(address: Address): Promise<bigint> {
    const client = getPublicClient();

    const balance = await client.readContract({
        address: config.tokenContract.address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
    });

    return balance;
}

/**
 * Verify a burn transaction
 * Checks: confirmation, from address, token contract, burn amount
 */
export async function verifyBurnTransaction(
    txHash: Hash,
    expectedBurner: Address,
    expectedAmount: bigint,
): Promise<{
    valid: boolean;
    error?: string;
    burnAmount?: bigint;
}> {
    try {
        const client = getPublicClient();

        // Get transaction receipt
        const receipt = await client.getTransactionReceipt({ hash: txHash });

        if (!receipt) {
            return { valid: false, error: "Transaction not found" };
        }

        // Check confirmation (at least 1 block)
        if (receipt.status !== "success") {
            return { valid: false, error: "Transaction failed" };
        }

        // Get transaction details
        const tx = await client.getTransaction({ hash: txHash });

        // Verify from address matches expected burner
        if (tx.from.toLowerCase() !== expectedBurner.toLowerCase()) {
            return {
                valid: false,
                error: `Transaction from address ${tx.from} does not match expected ${expectedBurner}`,
            };
        }

        // Verify transaction is to the token contract
        if (
            tx.to?.toLowerCase() !== config.tokenContract.address.toLowerCase()
        ) {
            return {
                valid: false,
                error: "Transaction is not to the configured token contract",
            };
        }

        // Parse Transfer events to find burn (transfer to 0x0)
        const burnEvents = receipt.logs.filter((log) => {
            if (
                log.address.toLowerCase() !==
                config.tokenContract.address.toLowerCase()
            ) {
                return false;
            }

            try {
                const decoded = decodeEventLog({
                    abi: erc20Abi,
                    data: log.data,
                    topics: log.topics,
                });

                // Check if it's a Transfer event to 0x0 (burn)
                return (
                    decoded.eventName === "Transfer" &&
                    decoded.args.to ===
                        "0x0000000000000000000000000000000000000000"
                );
            } catch {
                return false;
            }
        });

        if (burnEvents.length === 0) {
            return {
                valid: false,
                error: "No burn event found in transaction",
            };
        }

        // Get burn amount from first burn event
        const burnEvent = decodeEventLog({
            abi: erc20Abi,
            data: burnEvents[0].data,
            topics: burnEvents[0].topics,
        });

        const burnAmount = burnEvent.args.value as bigint;

        // Verify burn amount matches expected
        if (burnAmount !== expectedAmount) {
            return {
                valid: false,
                error: `Burn amount ${burnAmount} does not match expected ${expectedAmount}`,
                burnAmount,
            };
        }

        return { valid: true, burnAmount };
    } catch (error: any) {
        console.error("Error verifying burn transaction:", error);
        return { valid: false, error: error.message || "Verification failed" };
    }
}

/**
 * Check if a transaction is confirmed (has at least N confirmations)
 */
export async function isTransactionConfirmed(
    txHash: Hash,
    requiredConfirmations: number = 1,
): Promise<boolean> {
    try {
        const client = getPublicClient();

        const receipt = await client.getTransactionReceipt({ hash: txHash });
        if (!receipt) return false;

        const currentBlock = await client.getBlockNumber();
        const confirmations = Number(currentBlock - receipt.blockNumber);

        return confirmations >= requiredConfirmations;
    } catch {
        return false;
    }
}
