import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Divider from '@mui/material/Divider';
import { useAuth } from '../auth/AuthProvider';

const drawerWidth = 240;
export function useDrawerWidth() { return drawerWidth; }

export default function SidebarNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = useMemo(() => [
    { to: '/new', icon: <FlightTakeoffIcon />, label: 'Nueva' },
    { to: '/requests', icon: <ListAltIcon />, label: 'Mis solicitudes' },
    ...(user?.is_staff ? [{ to: '/operator', icon: <DashboardIcon />, label: 'Operador' }] : []),
  ], [user]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <List>
        {items.map(it => (
          <ListItem key={it.to} disablePadding>
            <ListItemButton component={Link} to={it.to} selected={pathname.startsWith(it.to)}>
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
}
