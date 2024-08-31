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
