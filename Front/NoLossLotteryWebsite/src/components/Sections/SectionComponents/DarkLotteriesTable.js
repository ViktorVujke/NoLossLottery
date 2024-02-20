import { MantineProvider, ColorSchemeProvider, useMantineTheme } from '@mantine/core';
import { useMemo, useState } from 'react';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import LotteriesTable from '../JoinLottery/LotteriesTable';

// Your data and LotteriesTable component...

const DarkLotteriesTable = () => {
  const [colorScheme, setColorScheme] = useState('dark'); // Manage color scheme state
  const theme = useMantineTheme();

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
      <MantineProvider theme={{ ...theme, colorScheme: colorScheme }}>
        <LotteriesTable />
      </MantineProvider>
    </ColorSchemeProvider>
  );
};

export default DarkLotteriesTable;
