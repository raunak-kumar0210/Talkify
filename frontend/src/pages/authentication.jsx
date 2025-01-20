import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';
import { AuthContext } from '../contexts/authContext';
import videoBackground from '../spring.mp4';

const defaultTheme = createTheme();

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();
    const [formState, setFormState] = React.useState(0); // 0 for login, 1 for signup
    const [open, setOpen] = React.useState(false);
    
    const { handleRegister, handleLogin } = React.useContext(AuthContext);


    let handleAuth = async () => {
        try {
            if (formState === 0) {

                let result = await handleLogin(username, password)
                console.log(result)


            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {

            console.log(err);
            let message = (err.response.data.message);
            setError(message);
        }
    }


    return (
        
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" 
                sx={{ 
                    height: '100vh',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <CssBaseline />
                

                <Grid
                    item
                    xs={false}
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        
                    }}
                >
                    <video
                        autoPlay
                        loop
                        muted
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            
                        }}
                    >
                        <source src={videoBackground} type="video/mp4" />
                        Your browser does not support the video tag.
                        
                    </video>
                </Grid>
                
                <Grid item xs={8} sm={5} md={4} 
                component={Paper} elevation={4} square
                sx={{
                    position: 'absolute',
                    // backgroundColor: 'transparent',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '10px',
                    
                }}>
                    <Box
                        sx={{
                            
                            my: 6,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            
                        }}
                    >
                        
                                                    
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <div  className="greeting">
                            {formState === 0 ? 
                            (                       
                                <h2>Welcome back!</h2>
                            ) : (
                                <h2>Join our community!</h2>
                            )}
                        </div>

                        <div>
                            <Button variant={formState === 0 ? "contained" : ""} onClick={() => { setFormState(0)}}>
                                Sign In
                            </Button>
                            <Button variant={formState === 1 ? "contained" : ""} onClick={() => { setFormState(1)}}>
                                Sign Up
                            </Button>
                        </div>
  

                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formState === 1 ? 
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Full Name"
                                    value={name}
                                    name='username'
                                    autoFocus
                                    onChange={(e) => setName(e.target.value)}
                                /> : <></> }
                            
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p style={{ color: "red" }}>{error}</p>
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                
            </Grid>
            

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message={message}
                // onClose={handleCloseSnackbar}
            />
        </ThemeProvider>
        
    );
    
}