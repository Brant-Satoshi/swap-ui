import { TransactionRequest } from "viem";
import { useSendTransaction, useWriteContract } from "wagmi";
import { erc20Abi } from "viem";

export type SwapParams = {
  to: `0x${string}`;
  data: `0x${string}`;
  value?: string;
};

export function useApprove() {
  const { writeContract, isPending: isApproving, isSuccess: isApproveSuccess, data: approveHash } = useWriteContract();

  const approve = (params: {
    tokenAddress: `0x${string}`;
    spender: `0x${string}`;
    amount: bigint;
  }) => {
    writeContract({
      address: params.tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [params.spender, params.amount],
    });
  };

  return {
    approve,
    isApproving,
    isApproveSuccess,
    approveHash,
  };
}

export function useSwap() {
  const { sendTransaction, isPending: isSwapping, isSuccess: isSwapSuccess, data: swapHash, error: swapError } = useSendTransaction();

  const swap = (params: {
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
  }) => {
    const tx: TransactionRequest = {
      to: params.to,
      data: params.data as `0x${string}`,
      value: params.value,
    };
    sendTransaction(tx);
  };

  return {
    swap,
    isSwapping,
    isSwapSuccess,
    swapHash,
    swapError,
  };
}
