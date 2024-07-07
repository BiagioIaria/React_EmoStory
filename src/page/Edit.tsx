import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';
import Button from '@mui/material/Button';

interface Data {
    [key: string]: string;
    none: string;
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
    none: string,
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
    return { none, preUnit, pre1, plan1, eff1, sc, pre2, plan2, eff2, effUnit };
}

const initialColumns: ColumnData[] = [
    {
        width: 0,
        label: '',
        dataKey: 'none',
    },
    {
        width: 120,
        label: 'preUnit',
        dataKey: 'preUnit',
    },
    {
        width: 120,
        label: 'pre1',
        dataKey: 'pre1',
    },
    {
        width: 120,
        label: 'plan1',
        dataKey: 'plan1',
    },
    {
        width: 120,
        label: 'eff1',
        dataKey: 'eff1',
    },
    {
        width: 120,
        label: 'sc',
        dataKey: 'sc',
    },
    {
        width: 120,
        label: 'pre2',
        dataKey: 'pre2',
    },
    {
        width: 120,
        label: 'plan2',
        dataKey: 'plan2',
    },
    {
        width: 120,
        label: 'eff2',
        dataKey: 'eff2',
    },
    {
        width: 120,
        label: 'effUnit',
        dataKey: 'effUnit',
    }
];

const nameRow = [
    'Title', 'Unit', 'Pre-Eff Unit', 'Plan', 'Goal', 'Agent', 'Value1', 'Value2', 'Emo1', 'Emo2'
];

const initialRows: Data[] = Array.from({ length: sample.length }, (_, index) => {
    const selection = sample[index];
    return createData(nameRow[index], ...selection);
});


function Edit() {
    const [columns, setColumns] = React.useState<ColumnData[]>(initialColumns);
    const [rows, setRows] = React.useState<Data[]>(initialRows);

    const addColumns = () => {
        const newColumnKeys = [`newColumn${columns.length}`, `newColumn${columns.length + 1}`];
        const newColumns = newColumnKeys.map(key => ({
            width: 120, label: key, dataKey: key as keyof Data
        }));

        setColumns([...columns, ...newColumns]);

        const updatedRows = rows.map(row => ({
            ...row,
            [newColumnKeys[0]]: 'New Value 1',
            [newColumnKeys[1]]: 'New Value 2',
        }));

        setRows(updatedRows);
    };

    const fixedHeaderContent = () => {
        const stickyStyle = {
            width: 200,
        };

        return (
            <TableRow>
                {columns.map((column, colIndex) => (
                    <TableCell
                        key={column.dataKey}
                        variant="head"
                        align={'right'}
                        style={colIndex === 0 ? stickyStyle : {width: column.width }}
                        sx={{
                            backgroundColor: 'background.paper',
                        }}
                    >
                        {column.label}
                    </TableCell>
                ))}
            </TableRow>
        );
    }

    const rowContent = (_index: number, row: Data) => {
        const stickyStyle = {
            position: 'sticky',
            left: 0,
            background: 'white',
            boxShadow: '2px 0 5px -2px rgba(0,0,0,0.3)',
        };

        return (
            <React.Fragment>
                {columns.map((column, colIndex) => (
                    <TableCell
                        key={column.dataKey}
                        align={'right'}
                        // @ts-ignore
                        style={colIndex === 0 ? stickyStyle : {}}
                    >
                        {row[column.dataKey]}
                    </TableCell>
                ))}
            </React.Fragment>
        );
    }

    return (
        <div className='edit'>
            <Button variant="contained" onClick={addColumns}>Add Columns</Button>
            <Paper style={{ height: 400}}>
                <TableVirtuoso
                    data={rows}
                    fixedHeaderContent={fixedHeaderContent}
                    itemContent={rowContent}
                />
            </Paper>
        </div>
    );
}

export default Edit;
