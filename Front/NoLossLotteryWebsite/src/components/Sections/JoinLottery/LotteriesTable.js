import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';

// Dummy data for lotteries
const data = [
  {
    address: "0x3a...d92",
    token: "USDC",
    TVL: 100000,
    daysUntilEnding: 7,
    currentReward: 500
  },
  {
    address: "0x1b...f4e",
    token: "DAI",
    TVL: 50000,
    daysUntilEnding: 12,
    currentReward: 250
  },
  {
    address: "0x7e...b3a",
    token: "LINK",
    TVL: 75000,
    daysUntilEnding: 5,
    currentReward: 375
  },
  {
    address: "0x5a...c8d",
    token: "ETH",
    TVL: 200000,
    daysUntilEnding: 10,
    currentReward: 1000
  },
  {
    address: "0x9f...a2c",
    token: "AAVE",
    TVL: 60000,
    daysUntilEnding: 8,
    currentReward: 300
  },
  {
    address: "0x4e...1d4",
    token: "BTC",
    TVL: 250000,
    daysUntilEnding: 15,
    currentReward: 1250
  },
  {
    address: "0x8f...c3d",
    token: "UNI",
    TVL: 40000,
    daysUntilEnding: 9,
    currentReward: 200
  },
  {
    address: "0xae...b2b",
    token: "SUSHI",
    TVL: 30000,
    daysUntilEnding: 4,
    currentReward: 150
  },
  {
    address: "0xbb...f8e",
    token: "COMP",
    TVL: 80000,
    daysUntilEnding: 13,
    currentReward: 400
  },
  {
    address: "0xcd...9a3",
    token: "SNX",
    TVL: 70000,
    daysUntilEnding: 11,
    currentReward: 350
  }
];


const LotteriesTable = () => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'address',
        header: 'Address',
      },
      {
        accessorKey: 'token',
        header: 'Token',
      },
      {
        accessorKey: 'TVL',
        header: 'TVL',
        // Custom cell rendering to format TVL as currency
        Cell: ({ value }) => `$${value}`
      },
      {
        accessorKey: 'daysUntilEnding',
        header: 'Days Until Ending',
      },
      {
        accessorKey: 'currentReward',
        header: 'Current Reward',
      },
    ],
    [],
  );

  const table = useMantineReactTable({
    columns,
    data,
  });

  return <MantineReactTable table={table} />;
};

export default LotteriesTable;
