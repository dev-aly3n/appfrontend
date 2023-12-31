import { useQuery } from "@tanstack/react-query";
import { multicall } from "@wagmi/core";
import { useAccount } from "wagmi";

import { vaultABI } from "@/hooks/generated/vault";
import { lendingTokens } from "@/hooks/use-price-data.hook";
import { type Vaults } from "@/types/onchain.types";
import { ErrorCause } from "@/utils/error-cause";
import { multiplyBigNumbers, oneUnitWithDecimals } from "@/utils/input.utils";

const _ithil4626customAbi = [
  {
    type: "function",
    name: "freeLiquidity",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

const VaultAbi = [...vaultABI];

export const placeHolderVaultData = lendingTokens.map((token) => ({
  key: token.name,
  token,
}));

const getVaultData = async (address?: string) => {
  const totalAssetsCalls = lendingTokens.map((token) => ({
    address: token.vaultAddress,
    abi: VaultAbi,
    functionName: "totalAssets",
  }));
  const freeLiquidityCalls = lendingTokens.map((token) => ({
    address: token.vaultAddress,
    abi: VaultAbi,
    functionName: "freeLiquidity",
  }));

  const balanceOfCalls =
    address != null
      ? lendingTokens.map((token) => ({
          address: token.vaultAddress,
          abi: VaultAbi,
          functionName: "balanceOf",
          args: [address],
        }))
      : [];

  const convertToAssetCalls = lendingTokens.map((token) => ({
    address: token.vaultAddress,
    abi: VaultAbi,
    functionName: "convertToAssets",
    args: [oneUnitWithDecimals(token.decimals)],
  }));
  const netLoans = lendingTokens.map((token) => ({
    address: token.vaultAddress,
    abi: VaultAbi,
    functionName: "netLoans",
  }));

  const multicallData = await multicall({
    contracts: [
      ...totalAssetsCalls,
      ...freeLiquidityCalls,
      ...balanceOfCalls,
      ...convertToAssetCalls,
      ...netLoans,
    ],
  });

  if (multicallData.some((data) => data == null)) {
    throw new Error("Error fetching vault data", {
      cause: new ErrorCause(
        "In localhost a wallet has to be connected for the UI to function"
      ),
    });
  }

  const data: Vaults = placeHolderVaultData.map((vault, idx, arr) => {
    // tvl informations are available at index 0...length
    const tvl = multicallData[idx].result as bigint;
    // freeLiquidity informations are available at index length...length*2

    // const freeLiquidity = multicallData[arr.length + idx].result as bigint;

    // deposited informations are available at index length*2...length*3
    const depositedShares =
      address != null
        ? (multicallData[arr.length * 2 + idx].result as bigint)
        : BigInt(0);
    // sharesToAsset informations are available at index length*3...length*4
    const sharesToAsset = multicallData[arr.length * 3 + idx].result as bigint;
    const depositedAssets = multiplyBigNumbers(
      depositedShares,
      sharesToAsset,
      vault.token.decimals
    );
    const borrowed = multicallData[arr.length * 4 + idx].result as bigint;
    return {
      key: vault.key,
      token: vault.token,
      tvl,
      borrowed,
      deposited: depositedAssets,
    };
  });
  return data;
};

export const useVaults = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: ["vaults", address],
    queryFn: async () => await getVaultData(address),
    keepPreviousData: true,

    retry: (failureCount, error: Error): boolean => {
      // avoid retrying if the error is handled
      if (ErrorCause.isErrorCause(error.cause)) return false;
      return true;
    },

    // FIXME: handle errors with chakra-ui/toast
    // onError: (error: Error) => {}
  });
};
