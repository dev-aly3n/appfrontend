import { formatUnits } from "viem";
import { Address, useContractReads } from "wagmi";

import { aaveABI } from "@/abi";
import { getVaultByTokenAddress } from "@/utils";

import { aaveAddress } from "./generated/aave";
import { useGetAgreementsByUser } from "./useGetAgreementByUser";

export const useOpenPositions = () => {
  const { data, isLoading: isAgreementsLoading } = useGetAgreementsByUser();

  const positions = [];

  // console.log(
  //   "data333",
  //   data?.[0]?.map((agreement) => ({
  //     abi: aaveABI,
  //     address: "0x9F1C69E1874d44Ad4ce79079C0b7Bd35E7882Ba8" as Address,
  //     functionName: "quote",
  //     args: [agreement],
  //   }))
  // );

  const quoteContracts = data?.[0]?.map((agreement) => ({
    abi: aaveABI,
    address: aaveAddress[98745] as Address,
    functionName: "quote",
    args: [agreement],
  }));

  const feeContracts = data?.[0]?.map((agreement) => ({
    abi: aaveABI,
    address: aaveAddress[98745] as Address,
    functionName: "computeDueFees",
    args: [agreement],
  }));

  const { data: quotes } = useContractReads({
    contracts: quoteContracts,
    enabled: !!data,
  });

  const { data: fees } = useContractReads({
    contracts: feeContracts,
    enabled: !!data,
  });

  const length = data?.[0].length || 0;

  for (let i = 0; i < length; i++) {
    const agreement = data?.[0][i];
    const amount = agreement?.loans[0].amount;
    const margin = agreement?.loans[0].margin;
    const quoteResult = quotes?.[i].result as unknown[] as bigint[];
    const quote = quoteResult?.[0];
    const feeResult = fees?.[i].result as unknown[] as bigint[];
    const fee = feeResult?.[0];

    const pnl =
      quote !== undefined &&
      fee !== undefined &&
      amount !== undefined &&
      margin !== undefined
        ? quote - fee - amount - margin
        : undefined;

    const tokenAddress = agreement?.loans[0].token;
    const decimals = tokenAddress
      ? getVaultByTokenAddress(tokenAddress).decimals
      : 1;

    positions.push({
      agreement,
      id: data?.[1][i],
      quote,
      pnl: pnl !== undefined ? formatUnits(pnl, decimals) : undefined,
      pnlPercentage:
        pnl !== undefined ? formatUnits(pnl / 100n, decimals) : undefined,
    });
  }

  return {
    positions,
    isLoading: isAgreementsLoading,
  };
};
