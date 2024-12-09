import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
  const navigate = useNavigate();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = useCallback(() => {
    handleClose();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsUserLoggedIn(false);
    setIsUserAdmin(false);
    setUserName('');
    navigate('/login');
    window.location.reload();
  }, [navigate]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsUserLoggedIn(true);
          setIsUserAdmin(user.isAdmin === true);
          setUserName(`${user.firstName} ${user.lastName}`);
        } catch (error) {
          console.error('Error parsing user data:', error);
          handleLogout();
        }
      } else {
        setIsUserLoggedIn(false);
        setIsUserAdmin(false);
        setUserName('');
      }
    };

    checkAuth();
  }, [handleLogout]);

  return (
    <AppBar position="static">
      <Container>
        <Toolbar>
          <DirectionsCarIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Araç Kiralama
          </Typography>
          
          <Button color="inherit" component={RouterLink} to="/">
            Ana Sayfa
          </Button>

          <Button color="inherit" component={RouterLink} to="/cars">
            Araçlar
          </Button>

          {isUserLoggedIn ? (
            <>
              {isUserAdmin && (
                <>
                  <Button color="inherit" component={RouterLink} to="/rentals">
                    Kiralamalar
                  </Button>
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/admin/dashboard"
                    startIcon={<AdminPanelSettingsIcon />}
                  >
                    Admin Paneli
                  </Button>
                </>
              )}

              {/* Kullanıcı Menüsü */}
              <Box sx={{ ml: 2 }}>
                <Button
                  color="inherit"
                  onClick={handleClick}
                  endIcon={<KeyboardArrowDownIcon />}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: 100,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      mr: 1,
                      bgcolor: 'primary.dark'
                    }}
                  >
                    {userName.charAt(0)}
                  </Avatar>
                  {userName}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem 
                    onClick={() => {
                      handleClose();
                      navigate('/profile');
                    }}
                  >
                    <PersonIcon sx={{ mr: 2 }} /> Profil
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 2 }} /> Çıkış Yap
                  </MenuItem>
                </Menu>
              </Box>
            </>
          ) : (
            <Box sx={{ ml: 2 }}>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ mr: 1 }}
              >
                Giriş Yap
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                variant="outlined"
              >
                Kayıt Ol
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
