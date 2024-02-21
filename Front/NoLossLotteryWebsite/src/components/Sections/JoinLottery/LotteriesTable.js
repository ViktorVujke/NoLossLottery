import React, { useEffect, useState, useMemo } from 'react';
import { N, ethers } from 'ethers';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import LotteryFactoryABI from '../../../contracts/LotteryFactoryABI.js';
import LotteryABI from '../../../contracts/LotteryABI.js'; // Ensure this is correctly imported
import ERC20ABI from '../../../contracts/ERC20ABI.js'; // Ensure this is correctly imported

import JoinLotteryModal from './JoinLotteryModal.js';

const factoryContractAddress = '0xad203b3144f8c09a20532957174fc0366291643c'; // Use your factory contract's address

const LotteriesTable = () => {
  const [lotteries, setLotteries] = useState([]);
  const [joinLotteryModal , setJoinLotteryModal] = useState(false)
  const [currentLottery, setCurrentLottery] = useState(null)

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
        console.log(info.totalSupplied)
        return {
          address: address,
          token: info.tokenAddress,
// Correct calculation of TVL using the token's decimals
          TVL: ethers.formatUnits(info.totalSupplied, decimals),
          daysUntilEnding: info.daysUntilEnd.toString(),
          currentReward: ethers.formatUnits(info.currentReward, decimals),
        };
      });

      const lotteriesData = await Promise.all(lotteryPromises);
      console.log(lotteriesData)
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
    ],
    [],
  );

  const handleRowClick = (row) => {
    alert('Row clicked:', row);
    // Place your function logic here. For example, opening a modal or calling another function.
  };

  const table = useMantineReactTable({
    columns,
    data: lotteries,
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setCurrentLottery( row.original);
        setJoinLotteryModal(true)
      }
      })
  });

  return <>
  <MantineReactTable table={table} />
  <JoinLotteryModal isOpen={joinLotteryModal} onClose={() => setJoinLotteryModal(false)} lottery = {currentLottery}/>
  </>;
};

export default LotteriesTable;
