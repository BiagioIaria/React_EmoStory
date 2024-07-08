import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import Button from '@mui/material/Button';

interface Data {
    [key: string]: string;
    preUnit: string;
    pre1: string;
    plan1: string;
    eff1: string;
    sc: string;
    pre2: string;
    plan2: string;
    eff2: string;
    effUnit: string;
}

interface ColumnData {
    dataKey: keyof Data;
    label: string;
    width: number;
}

type Sample = [string, string, string, string, string, string, string, string, string];

const sample: readonly Sample[] = [
    ['Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'],
    ['Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'],
    ['Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'],
    ['Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'],
    ['Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'],
    ['Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'],
    ['Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'],
];

function createData(
    preUnit: string,
    pre1: string,
    plan1: string,
    eff1: string,
    sc: string,
    pre2: string,
    plan2: string,
    eff2: string,
    effUnit: string,
): Data {
    return { preUnit, pre1, plan1, eff1, sc, pre2, plan2, eff2, effUnit };
}
const columnWidth = 120;

const initialColumns: ColumnData[] = [
    {
        width: columnWidth,
        label: 'preUnit',
        dataKey: 'preUnit',
    },
    {
        width: columnWidth,
        label: 'pre1',
        dataKey: 'pre1',
    },
    {
        width: columnWidth,
        label: 'plan1',
        dataKey: 'plan1',
    },
    {
        width: columnWidth,
        label: 'eff1',
        dataKey: 'eff1',
    },
    {
        width: columnWidth,
        label: 'sc',
        dataKey: 'sc',
    },
    {
        width: columnWidth,
        label: 'pre2',
        dataKey: 'pre2',
    },
    {
        width: columnWidth,
        label: 'plan2',
        dataKey: 'plan2',
    },
    {
        width: columnWidth,
        label: 'eff2',
        dataKey: 'eff2',
    },
    {
        width: columnWidth,
        label: 'effUnit',
        dataKey: 'effUnit',
    }
];

const initialRows: Data[] = Array.from({ length: sample.length }, (_, index) => {
    const selection = sample[index];
    return createData(...selection);
});

const buttonCells: [number, keyof Data, boolean][] = [
    [0, 'plan1', true],
    [2, 'eff1', false],
];

function Edit() {
    const [rows, setRows] = React.useState<Data[]>(initialRows);

    const addRow = () => {
        const newRow: Data = createData(
            'Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3', '3', '2'
        );
        setRows([...rows, newRow]);
    };

    const rowContent = (rowIndex: number, row: Data) => {
        return (
            <React.Fragment>
                {initialColumns.map((column) => (
                    <TableCell
                        key={column.dataKey}
                        align={'right'}
                        style={{ width: column.width }}
                        sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}
                    >
                        {buttonCells.some(([r, c, f]) => r === rowIndex && c === column.dataKey && f) ? (
                            <Button variant="contained" onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}>
                                {row[column.dataKey]}
                            </Button>
                        ) : (
                            row[column.dataKey]
                        )}
                    </TableCell>
                ))}
            </React.Fragment>
        );
    }

    return (
        <div className='edit'>
            <Button variant="contained" onClick={addRow}>Add rows</Button>
            <Paper style={{ height: 400 }}>
                <TableVirtuoso
                    data={rows}
                    itemContent={rowContent}
                />
            </Paper>
        </div>
    );
}

export default Edit;
