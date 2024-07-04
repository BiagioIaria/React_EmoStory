import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { TableVirtuoso } from 'react-virtuoso';

interface Data {
    calories: number;
    carbs: number;
    dessert: string;
    fat: number;
    id: number;
    protein: number;
}

interface ColumnData {
    dataKey: keyof Data;
    label: string;
    numeric?: boolean;
    width: number;
}

type Sample = [string, number, number, number, number];

const sample: readonly Sample[] = [
    ['Frozen yoghurt', 159, 6.0, 24, 4.0],
    ['Ice cream sandwich', 237, 9.0, 37, 4.3],
    ['Eclair', 262, 16.0, 24, 6.0],
    ['Cupcake', 305, 3.7, 67, 4.3],
    ['Gingerbread', 356, 16.0, 49, 3.9],
];

function createData(
    id: number,
    dessert: string,
    calories: number,
    fat: number,
    carbs: number,
    protein: number,
): Data {
    return { id, dessert, calories, fat, carbs, protein };
}

const columns: ColumnData[] = [
    {
        width: 0,
        label: '',
        dataKey: 'dessert',
    },
    {
        width: 120,
        label: 'Calories\u00A0(g)',
        dataKey: 'calories',
        numeric: true,
    },
    {
        width: 120,
        label: 'Fat\u00A0(g)',
        dataKey: 'fat',
        numeric: true,
    },
    {
        width: 120,
        label: 'Carbs\u00A0(g)',
        dataKey: 'carbs',
        numeric: true,
    },
    {
        width: 120,
        label: 'Protein\u00A0(g)',
        dataKey: 'protein',
        numeric: true,
    },
    {
        width: 120,
        label: 'Protein\u00A0(g)',
        dataKey: 'protein',
        numeric: true,
    },
];

const rows: Data[] = Array.from({ length: 200 }, (_, index) => {
    const randomSelection = sample[Math.floor(Math.random() * sample.length)];
    return createData(index, ...randomSelection);
});


function fixedHeaderContent() {
    const stickyStyle = {
        width: 200,
    };

    return (
        <TableRow>
            {columns.map((column, colIndex) => (
                <TableCell
                    key={column.dataKey}
                    variant="head"
                    align={column.numeric || false ? 'right' : 'left'}
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

function rowContent(_index: number, row: Data) {
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
                    align={column.numeric ? 'right' : 'left'}
                    // @ts-ignore
                    style={colIndex === 0 ? stickyStyle : {}}
                >
                    {row[column.dataKey]}
                </TableCell>
            ))}
        </React.Fragment>
    );
}

export default function ReactVirtualizedTable() {
    return (
        <Paper style={{ height: 400, width: '50%' }}>
            <TableVirtuoso
                data={rows}
                fixedHeaderContent={fixedHeaderContent}
                itemContent={rowContent}
            />
        </Paper>
    );
}
