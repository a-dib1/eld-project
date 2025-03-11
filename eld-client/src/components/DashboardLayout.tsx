import React, { useEffect, useState } from 'react';
import '../styles/componentsStyles/DashboardLayout.css'
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Link, Outlet, useParams } from 'react-router-dom';
import { GetTrips, getDriverTrips } from '../services/tripServices';
import socket from '../services/socket';

interface DashboardLayoutProps {
  isSidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  onTripTitleChange: (title: string | null) => void;
}

function DashboardLayout({ isSidebarCollapsed, onSidebarToggle, onTripTitleChange }: DashboardLayoutProps) {


  const { driver } = useSelector((state: RootState) => state.auth);
  const [trips, setTrips] = useState<GetTrips[]>([]);
  const { tripId } = useParams<{ tripId?: string }>();


  useEffect(() => {
    if (driver?.email) {
        getDriverTrips(driver.email)
            .then((data) => setTrips(data))
            .catch((error) => console.error("Error fetching trips:", error));

        const roomName = `user_${driver.email}`;
        socket.emit("join_room", { room: roomName });
        console.log(`🔒 Joined private room: ${roomName}`);
    }

    const handleTripCreated = (newTrip: GetTrips) => {
        console.log("📩 New Trip Received:", newTrip);
        setTrips((prevTrips) => [newTrip, ...prevTrips]);
    };

    const handleTripDeleted = (deletedTrip: { uniqueId: string }) => {
        console.log("🗑️ Trip Deleted:", deletedTrip);
        setTrips((prevTrips) => prevTrips.filter((trip) => trip.uniqueId !== deletedTrip.uniqueId));
    };

    socket.on("trip_created", handleTripCreated);
    socket.on("trip_deleted", handleTripDeleted);

    return () => {
        socket.off("trip_created", handleTripCreated);
        socket.off("trip_deleted", handleTripDeleted);
    };
}, [driver]);


  useEffect(() => {
      if (driver?.email) {
          getDriverTrips(driver.email)
              .then((data) => setTrips(data))
              .catch((error) => console.error('Error fetching trips:', error));
      }
  }, [driver]);

  return (

    <div className="DashMainLayoutContainer">
      <div className="DashMainLayoutContentC">

        <div className={`DashMainSidebarLayoutContainer ${isSidebarCollapsed ? 'DashMainSidebarLayoutContainerColl' : ''}`}>

          <div className="DashMainSidebarTopContainer">
            <div className="SidebarTopContainerContent">

              <div className="SidebarTopContentSec">
                <div className="SidebarTopCollBtn" onClick={onSidebarToggle}>
                  <div className='SidebarTopCollBtnLinesC'>
                    <div className="SidebarTopCollBtnLine"></div>
                    <div className="SidebarTopCollBtnLine"></div>
                    <div className="SidebarTopCollBtnLine"></div>
                  </div>
                </div>
              </div>
              <div className="SidebarTopContentSec">
                <Link to="/dashboard/trip-form" style={{textDecoration: 'none'}}>
                <div className="SidebarTopAddBtnC">
                  <p className="SidebarTopAddBtn">New Trip</p>
                  <img src='/plus.png' alt='' className="SidebarTopAddIcon" />
                </div>
                <div className="SidebarTopAddBtnCSm" onClick={onSidebarToggle}>
                  <p className="SidebarTopAddBtn">New Trip</p>
                  <img src='/plus.png' alt='' className="SidebarTopAddIcon" />
                </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="DashMainSidebarLayoutContentC">

          {[...trips].reverse().map((trip, index) => (
            <div className={`SidebarTripUniteContainer ${trip.uniqueId === tripId ? 'SidebarTripUniteContainerActive' : ''}`} key={index}>
              <Link to={`/dashboard/trip/${trip.uniqueId}`} style={{ textDecoration: 'none' }}>
              <div className="SidebarTripUniteContentC">
                <div className="SidebarTripHeadersC">
                  <p className="SidebarTripHeaders">{trip.tripTitle}</p>
                </div>
                <div className="SidebarTripDetailsC">
                  <p className="SidebarTripLocation">{trip.pickup}</p>
                  <p className="SidebarTripLocation">{trip.dropoff || 'N/A'}</p>
                  <div className="SidebarTripLocLay"></div>
                </div>
              </div>
              </Link>
            </div>
          ))}

          </div>

          <div className="DashMainSidebarLayoutContentCSm">

          {[...trips].reverse().map((trip, index) => (
            <div className={`SidebarTripUniteContainer ${trip.uniqueId === tripId ? 'SidebarTripUniteContainerActive' : ''}`} key={index} onClick={onSidebarToggle}>
              <Link to={`/dashboard/trip/${trip.uniqueId}`} style={{ textDecoration: 'none' }}>
              <div className="SidebarTripUniteContentC">
                <div className="SidebarTripHeadersC">
                  <p className="SidebarTripHeaders">{trip.tripTitle}</p>
                </div>
                <div className="SidebarTripDetailsC">
                  <p className="SidebarTripLocation">{trip.pickup}</p>
                  <p className="SidebarTripLocation">{trip.dropoff || 'N/A'}</p>
                  <div className="SidebarTripLocLay"></div>
                </div>
              </div>
              </Link>
            </div>
          ))}

          </div>

        </div>

        <div className={`DashMainOutletLayoutContainer ${isSidebarCollapsed ? 'DashMainOutletLayoutContainerColl' : ''}`}>
          <Outlet context={{onTripTitleChange}}/>
        </div>

      </div>
    </div>


  );
}

export default DashboardLayout;