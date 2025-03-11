import '../styles/pagesStyles/Dashboard.css'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

function Dashboard() {
  
    const { driver, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
    if (!isAuthenticated || !driver) {
      return <div>Please log in to view the dashboard.</div>;
    }
  
    return (
      <div className="DashboardMainContainer">
        <div className="DashboardMainContentContainer">
          <div className="DashboardMainCenterContainer">

            <div className="DashboardMainHeadersC">
              <p className="DashboardMainHeaders">Welcome, {driver.fullName}</p>
            </div>

          </div>
        </div>
      </div>
  );
}

export default Dashboard;