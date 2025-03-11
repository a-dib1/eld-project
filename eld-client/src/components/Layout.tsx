import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { logoutThunk } from '../redux/slices/authSlice';
import "../styles/componentsStyles/Layout.css"

interface LayoutProps {
  children: React.ReactNode;
  isSidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  tripTitle: string | null;
}

function Layout({ children, isSidebarCollapsed, onSidebarToggle }: LayoutProps) {
    const dispatch = useDispatch();
    const { driver, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const location = useLocation();
    const currentPathname = location.pathname;
    const firstInitial = driver?.fullName?.charAt(0)?.toUpperCase() || '';
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  
    const handleLogoutModal = () => {
      setIsLogoutOpen((prev) => !prev);
    };

  return (
    <div className="LayoutMainContainer">
      <div className="LayoutMainContentC">

        <div className={`LayoutMainNavContainer ${(currentPathname === "/" || currentPathname === "/login" || currentPathname === "/register" || isSidebarCollapsed) ? 'LayoutMainNavContainerHome' : ''}`}>
          <div className="LayoutMainNavContentC">

            <div className="LayouMainNavBackLay"></div>

            <div className="LayoutMainNavSec">
              {isSidebarCollapsed && (
              <div className="SidebarTopCollBtn" onClick={onSidebarToggle}>
                <div className='SidebarTopCollBtnLinesC'>
                  <div className="SidebarTopCollBtnLine"></div>
                  <div className="SidebarTopCollBtnLine"></div>
                  <div className="SidebarTopCollBtnLine"></div>
                </div>
              </div>
              )}

              {!isSidebarCollapsed && (
              <div className="SidebarTopCollBtnSm" onClick={onSidebarToggle}>
                <div className='SidebarTopCollBtnLinesC'>
                  <div className="SidebarTopCollBtnLine"></div>
                  <div className="SidebarTopCollBtnLine"></div>
                  <div className="SidebarTopCollBtnLine"></div>
                </div>
              </div>
              )}

              <div className="MainNavTopCLogoC">
                <p className="MainNavTopCLogo">ELD-APP</p>
              </div>
            </div>

            <div className="LayoutMainNavSec">
              {!isAuthenticated && (
              <div className="LayoutMainNavLinksC">
                <div className="LayoutMainNavLink">
                  <Link to="/login" style={{textDecoration: 'none'}}><p className='MainNavLinkTagFill'>Login</p></Link>
                </div>
                <p className="MainNavLinksMidTag">Or</p>
                <div className="LayoutMainNavLink">
                  <Link to="/register" style={{textDecoration: 'none'}}><p className='MainNavLinkTag'>Register</p></Link>
                </div>
              </div>
              )}

              {isAuthenticated && (
              <div className="LayoutMainNavProfileC">
                <div className="MainNavProfilInitsC" onClick={handleLogoutModal}>
                  <p className="MainNavProfileInit">{firstInitial}</p>
                </div>
              </div>
              )}


              <div className={`LayoutMainNAvLogoutPopC ${isLogoutOpen ? 'LayoutMainNAvLogoutPopCOpen' : ''}`} onClick={handleLogoutModal}>
                <p className={`LogoutTag ${isLogoutOpen ? 'LogoutTagOpen' : ''}`} onClick={() => dispatch(logoutThunk() as any)}>Logout</p>
              </div>


            </div>

            {currentPathname === "/dashboard/trip-form" && (
            <div className="LayoutMainNavFormTagC">
              <p className="LayoutMainNavFormTag">Create a New Trip</p>
            </div>
            )}

          </div>
        </div>

        <main className="LayouMainChildrenContainer">
            <div className="LayoutMainChildrenContentC">
                {children}
            </div>
        </main>

      </div>
    </div>
  );
}

export default Layout;