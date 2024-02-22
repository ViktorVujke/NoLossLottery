import React, { useEffect, useState, useMemo } from 'react';
import { ethers } from 'ethers';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import LotteryFactoryABI from '../../../contracts/LotteryFactoryABI.js';
import LotteryABI from '../../../contracts/LotteryABI.js'; // Ensure this is correctly imported
import ERC20ABI from '../../../contracts/ERC20ABI.js'; // Ensure this is correctly imported

import JoinLotteryModal from './JoinLotteryModal.js';

const factoryContractAddress = '0xb6057e08a11da09a998985874fe2119e98db3d5d'; // Use your factory contract's address

const LotteriesTable = () => {
  const [lotteries, setLotteries] = useState([]);
  const [joinLotteryModal, setJoinLotteryModal] = useState(false);
  const [currentLottery, setCurrentLottery] = useState(null);

  useEffect(() => {
    const fetchLotteries = async () => {
      const provider = new ethers.JsonRpcProvider();
      const factoryContract = new ethers.Contract(
        factoryContractAddress,
        LotteryFactoryABI,
        provider
      );

      const lotteryAddresses = await factoryContract.getLotteries();
      
      const lotteryPromises = lotteryAddresses.map(async (address) => {
        const lotteryContract = new ethers.Contract(
          address,
          LotteryABI,
          provider
        );
        const info = await lotteryContract.getLotteryInfo();
        const tokenContract = new ethers.Contract(info.tokenAddress, ERC20ABI, provider);

        // Fetch the token's decimals
        const decimals = await tokenContract.decimals();
        const endDate = new Date(Number(info.depositEndTime * 1000n));

        // Extract the day, month, and year from endDate
      return {
          address: address,
          token: info.tokenAddress,
          TVL: ethers.formatUnits(info.totalSupplied, decimals),
          daysUntilEnding: info.daysUntilEnd.toString(),
          currentReward: ethers.formatUnits(info.currentReward, decimals),
          depositEndTime: endDate.toLocaleDateString(), // Convert UNIX timestamp to readable date
          minimumDeposit: ethers.formatUnits(info.minimumDeposit, decimals), // Assuming the minimum deposit is in the same unit as the token
        };
      });

      const lotteriesData = await Promise.all(lotteryPromises);
      setLotteries(lotteriesData);
    };

    fetchLotteries();
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: 'address', header: 'Address' },
      { accessorKey: 'token', header: 'ERC20 Token Address' },
      { accessorKey: 'TVL', header: 'TVL' },
      { accessorKey: 'daysUntilEnding', header: 'Days Until Ending' },
      { accessorKey: 'currentReward', header: 'Current Reward' },
      { accessorKey: 'depositEndTime', header: 'Deposit End Date' }, // New column for depositEndTime
      { accessorKey: 'minimumDeposit', header: 'Minimum Deposit' }, // New column for minimumDeposit
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data: lotteries,
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: () => {
        setCurrentLottery(row.original);
        setJoinLotteryModal(true);
      }
    })
  });

  return (
    <>
      <MantineReactTable table={table} />
      <JoinLotteryModal isOpen={joinLotteryModal} onClose={() => setJoinLotteryModal(false)} lottery={currentLottery} />
    </>
  );
};

export default LotteriesTable;
