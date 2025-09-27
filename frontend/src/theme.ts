import { createTheme } from '@mui/material/styles';

// Paleta solicitada:
// #033f63 (primario), #28666e (secundario/acento), #7c9885 (success),
// #b5b682 (info), #fedc97 (warning)
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#033f63', contrastText: '#ffffff' },
    secondary: { main: '#28666e', contrastText: '#ffffff' },
    success: { main: '#7c9885' },
    info: { main: '#b5b682' },
    warning: { main: '#fedc97', contrastText: '#4b4b4b' },
    background: { default: '#f7f9fb', paper: '#ffffff' },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiButton: { defaultProps: { variant: 'contained' } },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'small' } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: 'none' } } },
  },
});
