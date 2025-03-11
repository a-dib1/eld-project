import '../styles/pagesStyles/Home.css'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

function Home() {

    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="HomeMainContainer">
        <div className="HomeMainContentContainer">
            <div className="HomeMainCenterContentC">
                <div className="HomeMainCenterHeadersC">
                    <p className="HomeMainCenterHeaders">Welcome To ELD-Project</p>
                </div>

                {isAuthenticated ? (
                <Link to='/dashboard' style={{textDecoration:'none'}}>
                    <div className="HomeMainCenterLinkBtnC">
                        <p className="HomeMainCenterLinkBtn">Go To Dashboard</p>
                    </div>
                </Link>
                ) : (
                <>
                <Link to='/login' style={{textDecoration:'none'}}>
                    <div className="HomeMainCenterLinkBtnC">
                        <p className="HomeMainCenterLinkBtnLog">Login</p>
                    </div>
                </Link>
                <Link to='/register' style={{textDecoration:'none'}}>
                    <div className="HomeMainCenterLinkBtnC">
                        <p className="HomeMainCenterLinkBtnTag">Don't have an account?</p>
                        <p className="HomeMainCenterLinkBtnReg">Register</p>
                    </div>
                </Link>
                </>
                )}
            </div>
        </div>
    </div>
  );
}

export default Home;