import { useMemo } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';

// Dummy data for lotteries
const data = [
  {
    address: "0x3a...d92",
    token: "USDC",
    TVL: 100000,
    daysUntilEnding: 7
  },
  {
    address: "0x1b...f4e",
    token: "DAI",
    TVL: 50000,
    daysUntilEnding: 12
  },
  {
    address: "0x7e...b3a",
    token: "LINK",
    TVL: 75000,
    daysUntilEnding: 5
  },
  {
    address: "0x5a...c8d",
    token: "ETH",
    TVL: 200000,
    daysUntilEnding: 10
  },
  {
    address: "0x9f...a2c",
    token: "AAVE",
    TVL: 60000,
    daysUntilEnding: 8
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
