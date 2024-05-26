import './../App.css';
import Button from '@mui/material/Button';


function Home() {

    return (<Button
        variant="contained"
        component="label"
    >
        Upload File
        <input
            type="file"
            hidden
            onChange={(event) => {
                const file = event.target.files![0];
                console.log(file);
                const reader = new FileReader();
                reader.onload = function(e) {
                    console.log(e.target!.result);
                };
                reader.readAsText(file);
            }}
        />
    </Button>);
}

export default Home;