/** @jsxImportSource @emotion/react */
import tw from 'twin.macro';
import React, { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { useEthers, useTokenBalance } from '@usedapp/core';

import StakeControlPanel from '@/components/composed/stake/StakeControlPanel';
import { ITableRow } from '@/components/based/table/DataTable';
import Txt from '@/components/based/Txt';
import { formatAmount, getTokenByAddress } from '@/global/utils';
import { useBalance, useVaultData } from '@/hooks/useVault';
import { useTotalSupply } from '@/hooks/useToken';

type IStakeTableRow = ITableRow;

const StakeTableRow: FC<IStakeTableRow> = ({ head, row, hoverable }) => {
  const navigate = useNavigate();
  const { account } = useEthers();
  const [expanded, setExpanded] = useState(false);
  const vaultTokenAddress = row['token_address'] as string;
  const vaultToken = getTokenByAddress(vaultTokenAddress);
  const vaultBalance = useBalance(vaultTokenAddress);
  const vaultData = useVaultData(vaultTokenAddress);
  const wrappedTokenBalance = useTokenBalance(vaultData?.wrappedToken, account);
  const wrappedTokenSupply = useTotalSupply(vaultData?.wrappedToken);

  const tvl = useMemo(() => {
    return vaultBalance.plus(BigNumber(vaultData?.netLoans.toString()));
  }, [vaultBalance, vaultData]);

  const totalBorrowed = useMemo(() => {
    if (!vaultData?.netLoans || vaultBalance.isZero()) return 0;
    return BigNumber(vaultData?.netLoans.toString());
  }, [vaultBalance, vaultData]);

  const shareValue = useMemo(() => {
    if (wrappedTokenSupply.isZero()) return null;
    return vaultBalance.dividedBy(wrappedTokenSupply);
  }, [vaultBalance, wrappedTokenSupply]);

  const aprValue = useMemo(() => {
    if (!shareValue || !vaultData?.creationTime) return null;
    const passedTime =
      Math.floor(new Date().getTime() / 1000) -
      Number(vaultData?.creationTime.toString());
    const value = shareValue
      .minus(1)
      .multipliedBy(31536000)
      .dividedBy(passedTime)
      .multipliedBy(100);

    if (value.gt(0)) return value.toFixed(2);
    else return 0;
  }, [shareValue, vaultData?.creationTime]);

  const handleInfoClick = async () => {
    navigate(`/stake/details?token=${vaultTokenAddress}`);
  };

  return (
    <>
      <tr
        css={[
          tw`cursor-pointer bg-primary-100 transition-all transition-duration[300ms] border-b-1 border-b-primary-300 last:border-b-0`,
          hoverable && tw`hover:bg-primary-200`,
        ]}
        onClick={() => {
          setExpanded(!expanded);
        }}
      >
        {head.map((headCell) => {
          switch (headCell.id) {
            case 'annual_percentage':
              return (
                <td key={headCell.id} css={tw`py-4 cursor-pointer`}>
                  <Txt.Body2Regular>
                    {aprValue ? `${aprValue}%` : '0%'}
                  </Txt.Body2Regular>
                </td>
              );
            case 'total_value':
              return (
                <td key={headCell.id} css={tw`py-4 cursor-pointer`}>
                  <Txt.Body2Regular>
                    {formatAmount(tvl, vaultToken?.decimals)}
                  </Txt.Body2Regular>
                </td>
              );
            case 'total_borrowed':
              return (
                <td key={headCell.id} css={tw`py-4 cursor-pointer`}>
                  <Txt.Body2Regular>
                    {formatAmount(totalBorrowed, vaultToken?.decimals)}
                  </Txt.Body2Regular>
                </td>
              );
            case 'owned':
              return (
                <td key={headCell.id} css={tw`py-4 cursor-pointer`}>
                  <Txt.Body2Regular>
                    {wrappedTokenBalance?.gt(0)
                      ? formatAmount(
                          wrappedTokenBalance.toString(),
                          vaultToken?.decimals
                        )
                      : '0'}
                  </Txt.Body2Regular>
                </td>
              );
            case 'action':
              return (
                <td key={headCell.id} css={tw`py-4 cursor-pointer`}>
                  <button
                    onClick={handleInfoClick}
                    css={[
                      tw`rounded-lg py-1 px-2 border-1 border-primary-400 text-font-100 hover:bg-primary-200 transition-all transition-duration[200ms]`,
                    ]}
                  >
                    Info
                  </button>
                </td>
              );
            default:
              return (
                <td
                  key={headCell.id}
                  css={[
                    tw`py-4 cursor-pointer last:pr-4`,
                    headCell.id === 'vault_name' && tw`pl-4`,
                  ]}
                  id="stake"
                >
                  {row[headCell.id]}
                </td>
              );
          }
        })}
      </tr>
      {vaultToken && (
        <tr style={{ display: !expanded ? 'none' : undefined }}>
          <td tw="bg-primary-100" colSpan={head.length}>
            <StakeControlPanel
              token={vaultToken}
              vaultData={vaultData}
              vaultBalance={vaultBalance}
              wrappedTokenBalance={wrappedTokenBalance}
              wrappedTokenSupply={wrappedTokenSupply}
            />
          </td>
        </tr>
      )}
    </>
  );
};

export default StakeTableRow;
