import AddIcon from '@mui/icons-material/Add';
import {Box, IconButton, Menu, MenuItem} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import {Link} from "react-router-dom";
import {useRef, useState} from "react";

function Home() {
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const iconButtonRef = useRef(null);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div className={'home'}>
            <Box sx={{display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%'}}>
                <IconButton
                    aria-label="add"
                    size="large"
                    onClick={handleClick}
                    ref={iconButtonRef}
                >
                    <AddIcon fontSize="inherit"/>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <Box sx={{display: 'flex', flexDirection: 'row', p: 1}}>
                        <MenuItem onClick={handleClose}>
                            <Link to='/edit?temp=1' style={{textDecoration: 'none', color: 'inherit'}}>
                                <EditIcon sx={{mr: 1}}/> Edit 1
                            </Link>
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <Link to='/edit?temp=2' style={{textDecoration: 'none', color: 'inherit'}}>
                                <EditIcon sx={{mr: 1}}/> Edit 2
                            </Link>
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <Link to='/edit?temp=3' style={{textDecoration: 'none', color: 'inherit'}}>
                                <EditIcon sx={{mr: 1}}/> Edit 3
                            </Link>
                        </MenuItem>
                    </Box>
                </Menu>
            </Box>
        </div>
    );
}

export default Home;