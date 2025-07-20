import { useState } from "react";
import { useLogin, useNotify, Login } from "react-admin";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Container,
} from "@mui/material";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch {
      notify("Invalid email or password", { type: "error" });
    }
  };

  return (
    <Login sx={{ backgroundImage: 'none', backgroundColor: '#FAF8F3' }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 8, marginBottom: 8 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Admin Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ boxShadow: 'none'}}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              variant="outlined"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              variant="outlined"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Login>
  );
};

export default LoginPage;
