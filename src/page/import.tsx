import {Box, Button, Typography, Stack} from '@mui/material';
import React, {useState} from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function Import() {
    const [kb, setKb] = useState({});
    const [fileName, setFileName] = useState<string | null>(null);
    console.log(kb)
    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        readFile(file);
    };

    const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        readFile(file);
    };

    const readFile = (file: File) => {
        const reader = new FileReader();
        setFileName(file.name); // Set the file name when the file is uploaded

        reader.onload = (e) => {
            const text = e.target!.result;
            const parsedData = parseText(text);
            setKb(parsedData);
        };

        reader.readAsText(file);
    };

    const parseText = (text: any) => {
        const lines = text.split('&');
        const result: any = {};

        lines.forEach((line: { split: (arg0: string) => [any, any]; }) => {
            const [key, value] = line.split('(');
            const cleanKey = key.trim();
            const cleanValue = value.replace(')', '').trim();

            if (cleanKey === 'hasValue') {
                const [a, v] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), v: v.trim()});
            } else if (cleanKey === 'hasGoal') {
                const [a, g] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), g: g.trim()});
            } else if (cleanKey === 'intends') {
                const [a, p] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({a: a.trim(), p: p.trim()});
            } else if (cleanKey === 'achieves') {
                const [p, g] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p: p.trim(), g: g.trim()});
            } else if (cleanKey === 'hasPrecondition') {
                const [pu, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({pu: pu.trim(), s: s.trim()});
            } else if (cleanKey === 'hasEffect') {
                const [pu, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({pu: pu.trim(), s: s.trim()});
            } else if (cleanKey === 'atStakeInSet') {
                const [v, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({v: v.trim(), s: s.trim()});
            } else if (cleanKey === 'inBalanceInSet') {
                const [v, s] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({v: v.trim(), s: s.trim()});
            } else if (cleanKey === 'isMotivationFor') {
                const [p, u] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p: p.trim(), u: u.trim()});
            } else if (cleanKey === 'inConflictWith') {
                const [p1, p2] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p1: p1.trim(), p2: p2.trim()});
            } else if (cleanKey === 'inSupportOf') {
                const [p1, p2] = cleanValue.split(',');
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push({p1: p1.trim(), p2: p2.trim()});
            } else {
                if (!result[cleanKey]) {
                    result[cleanKey] = [];
                }
                result[cleanKey].push(cleanValue);
            }
        });

        return result;
    };

    return (
        <div className={'import'}>
            <Box
                sx={{
                    padding: 3,
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    textAlign: 'center',
                    position: 'relative',
                    '&:hover': {
                        backgroundColor: '#f5f5f5',
                    },
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
            >
                <Stack direction="column" alignItems="center" spacing={2}>
                    <CloudUploadIcon sx={{fontSize: 50, color: '#1976d2'}}/>
                    <Typography variant="h6">Drag and drop your file here, or</Typography>
                    <Button variant="contained" component="label" startIcon={<CloudUploadIcon/>}>
                        Import File
                        <input type="file" accept=".txt" onChange={handleFileUpload} hidden/>
                    </Button>
                </Stack>

                {fileName && (
                    <Box sx={{marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <CheckCircleIcon sx={{color: 'green', marginRight: 1}}/>
                        <Typography variant="body1">
                            File <strong>{fileName}</strong> uploaded successfully!
                        </Typography>
                    </Box>
                )}
            </Box>
        </div>
    );
}

export default Import;
