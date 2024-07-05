import AddIcon from '@mui/icons-material/Add';
import {Box, IconButton} from "@mui/material";
import {Link} from "react-router-dom";

function Home() {
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%' }}>
            <Link to='/edit'>
                <IconButton aria-label="add" size="large">
                    <AddIcon fontSize="inherit" />
                </IconButton>
            </Link >
        </Box>
    );
}

export default Home;