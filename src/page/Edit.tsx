import * as React from 'react';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import {Table, TableBody, TableContainer, TableHead, TextField} from '@mui/material';

interface Data {
    [key: string]: string;

    unit_b: string;
    preUnit: string;
    plan1: string;
    unit: string;
    plan2: string;
    effUnit: string;
    unit_n: string;
}

interface ColumnData {
    dataKey: keyof Data;
    label: string;
    width: number;
}

type Sample = [string, string, string, string, string, string, string];

const sampleStandard: readonly Sample[] = [
    ['', '', 'Plans of Agent 1', '', 'Plans of Agent 2', '', ''],
    ['', '', 'Values of Agent 1', '', 'Values of Agent 2', '', ''],
    ['', '', 'Calculated emotions of Agent 1', '', 'Calculated emotions of Agent 2', '', ''],
];

const sampleB: readonly Sample[] = [
    ['Plans of Agent 1', '', '', '', 'Plans of Agent 2', '', ''],
    ['Values of Agent 1', '', '', '', 'Values of Agent 2', '', ''],
    ['Calculated emotions of Agent 1', '', '', '', 'Calculated emotions of Agent 2', '', ''],
];

const sampleN: readonly Sample[] = [
    ['', '', 'Plans of Agent 1', '', '', '', 'Plans of Agent 2'],
    ['', '', 'Values of Agent 1', '', '', '', 'Values of Agent 2'],
    ['', '', 'Calculated emotions of Agent 1', '', '', '', 'Calculated emotions of Agent 2'],
];

function createData(
    unit_b: string,
    preUnit: string,
    plan1: string,
    unit: string,
    plan2: string,
    effUnit: string,
    unit_n: string
): Data {
    return {unit_b, preUnit, plan1, unit, plan2, effUnit, unit_n};
}

const columnWidth = 120;

const initialColumns: ColumnData[] = [
    {
        width: columnWidth,
        label: 'unit i-',
        dataKey: 'unit_b',
    },
    {
        width: columnWidth,
        label: 'Preconditions Unit i',
        dataKey: 'preUnit',
    },
    {
        width: columnWidth,
        label: '',
        dataKey: 'plan1',
    },
    {
        width: columnWidth,
        label: 'unit i',
        dataKey: 'unit',
    },
    {
        width: columnWidth,
        label: '',
        dataKey: 'plan2',
    },
    {
        width: columnWidth,
        label: 'Effects Unit i',
        dataKey: 'effUnit',
    },
    {
        width: columnWidth,
        label: 'Unit i+',
        dataKey: 'unit_n',
    }
];

const initialRows: Data[] = Array.from({length: sampleStandard.length}, (_, index) => {
    const selection = sampleStandard[index];
    return createData(...selection);
});

function Edit() {
    const [rows, setRows] = React.useState<Data[]>(initialRows);

    const addRow = () => {
        const newRow: Data = createData(
            'Frozen yoghurt', '159', '6.0', '24', '4.0', '2', '3',
        );
        setRows([...rows, newRow]);
    };

    const header = () => (
        <TableRow>
            {initialColumns.map((col, index) => (
                <TableCell key={col.dataKey}
                           style={{width: col.width, textAlign: "center"}}
                >{col.label}</TableCell>
            ))}
        </TableRow>
    );

    const rowContent = (rowIndex: number, row: Data) => {
        return (
            <React.Fragment>
                {initialColumns.map((column) => {
                    let cellContent;

                    if (0 === rowIndex && ('plan1' === column.dataKey || 'plan2' === column.dataKey)) {
                        cellContent = (
                            <>
                                <Button variant="outlined"
                                        onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}
                                        sx={{ m: 1 }}>
                                    {'accomplished?'}
                                </Button>
                                <Button variant="outlined"
                                        onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}
                                        sx={{ m: 1 }}>
                                    {'P Agent ' +  column.dataKey[column.dataKey.length-1] + ' Title'}
                                </Button>
                                <Button variant="outlined"
                                        onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}
                                        sx={{ m: 1 }}>
                                    {'G Plan Agent ' +  column.dataKey[column.dataKey.length-1]}
                                </Button>
                                <Button variant="outlined"
                                        onClick={() => alert(`Button clicked in row ${rowIndex + 1}, column ${column.dataKey}`)}
                                        sx={{ m: 1 }}>
                                    {'Agent ' +  column.dataKey[column.dataKey.length-1]}
                                </Button>
                            </>
                        );
                    } else {
                        cellContent = row[column.dataKey];
                    }

                    return (
                        <TableCell
                            key={column.dataKey}
                            align={'right'}
                            sx={{borderRight: '1px solid rgba(224, 224, 224, 1)', width: column.width}}
                        >
                            {cellContent}
                        </TableCell>
                    );
                })}
            </React.Fragment>
        );
    };


    return (
        <div className='edit'>
            <Button variant="contained" onClick={addRow}>Add rows</Button>
            <Paper style={{display: 'flex', flexDirection: 'column', height: '540px'}}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead style={{position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1}}>
                            <TableRow>
                                <TableCell align="center" colSpan={initialColumns.length}
                                           sx={{
                                               textAlign: 'center',
                                           }}>
                                    <TextField id="Title" label="Title" variant="standard"/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align={"center"} colSpan={initialColumns.length}
                                           className="triangle-container">
                                    Unit Hierarchy
                                </TableCell>
                            </TableRow>
                            {header()}
                        </TableHead>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    {rowContent(index, row)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
}

export default Edit;
