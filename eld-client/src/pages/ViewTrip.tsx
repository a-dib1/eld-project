import React, { useEffect, useRef, useState } from 'react';
import '../styles/pagesStyles/ViewTrip.css'
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { LatLngTuple, Icon } from 'leaflet';
import { GetTripData, LogSheetData, addLogSheetsToTrip, deleteTrip, updateLogSheets } from '../services/tripServices';
import { fetchTripData, LogSheetWithCoords, LogSheetDistance, Coordinates } from '../services/mapServices';
import 'leaflet/dist/leaflet.css';
import { computeValidLogSheets } from '../services/eldLogServices';
import ELDLog from '../components/ELDLog';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import AddLogSheetModal from '../components/AddLogSheetModal';
import LogSheetModal from '../components/LogSheetModal';
import Loading from '../components/Loading';

const pickupIcon = new Icon({
    iconUrl: '/location-2.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const dropoffIcon = new Icon({
    iconUrl: '/drop-off.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const currentLocationIcon = new Icon({
    iconUrl: '/pin.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const fuelingIcon = new Icon({
    iconUrl: '/gas-pump.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

const restBreakIcon = new Icon({
    iconUrl: '/stop-watch.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });

function MapResizeHandler({ isIconSelected }: { isIconSelected: boolean }) {
    const map = useMap();
  
    useEffect(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, [isIconSelected, map]);
  
    return null;
  }

function FitBounds({ coords }: { coords: LatLngTuple[] }) {
    const map = useMap();
    useEffect(() => {
        if (coords.length > 0) {
            map.fitBounds(coords);
        }
    }, [map, coords]);
    return null;
}

function ViewTrip() {
    const { tripId } = useParams<{ tripId: string }>();
    const { driver } = useSelector((state: RootState) => state.auth);
    const [trip, setTrip] = useState<GetTripData | null>(null);
    const [loading, setLoading] = useState(true);
    const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
    const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
    const [logSheetCoords, setLogSheetCoords] = useState<LogSheetWithCoords[]>([]);
    const [logSheetDistances, setLogSheetDistances] = useState<LogSheetDistance[]>([]);
    const [totalCycleHours, setTotalCycleHours] = useState<number>(0);
    const [daysSpan, setDaysSpan] = useState<number>(0);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editModalData, setEditModalData] = useState<{ logSheet: LogSheetData; uniqueId: string; index: number } | null>(null);
    const [isIconSelected, setIsIconSelected] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        async function loadTripData() {
            if (tripId) {
                setLoading(true);
                const { trip, pickupCoords, dropoffCoords, logSheetCoords, logSheetDistances, totalCycleHours, daysSpan } = await fetchTripData(tripId);
                setTrip(trip);
                setPickupCoords(pickupCoords);
                setDropoffCoords(dropoffCoords);
                setLogSheetCoords(logSheetCoords);
                setLogSheetDistances(logSheetDistances);
                setTotalCycleHours(totalCycleHours);
                setDaysSpan(daysSpan);
                setLoading(false);
            }
        }
        loadTripData();
    }, [tripId]);

    const openAddModal = () => {
        setIsAddModalOpen(true);
    };


    const addLogSheet = async (newLogSheet: LogSheetData) => {
        if (!tripId) return;
        try {
        await addLogSheetsToTrip(tripId, [newLogSheet]);
        window.location.reload();
        } catch (error) {
        console.error('Error adding new log sheet:', error);
        alert('Failed to add new log sheet.');
        }
    };

    const openEditModal = (index: number) => {
        const logSheet = trip!.logSheets[index];
        setEditModalData({
        logSheet: {
            currentLocation: logSheet.currentLocation,
            pickup: logSheet.pickup,
            dropoff: logSheet.dropoff || '',
            currentCycleUsed: logSheet.currentCycleUsed,
        },
        uniqueId: logSheet.uniqueId,
        index,
        });
    };

    const handleSaveLogSheet = async (updatedLogSheet: LogSheetData, index: number) => {
        if (!tripId) return;
        const originalLogSheet = trip!.logSheets[index];
        const editedLogSheet = { uniqueId: originalLogSheet.uniqueId, ...updatedLogSheet };
        try {
        await updateLogSheets(tripId, [editedLogSheet]);
        setEditModalData(null);
        window.location.reload();
        } catch (error) {
        console.error('Error updating log sheet:', error);
        alert('Failed to update log sheet.');
        }
    };

    const handleDeleteTrip = async () => {
        if (!tripId) return;
        const confirmDelete = window.confirm('Are you sure you want to delete this trip? This action cannot be undone.');
        if (confirmDelete) {
        try {
            await deleteTrip(tripId);
            alert('Trip deleted successfully.');
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert('Failed to delete trip.');
        }
        }
    };
            

    if (loading) return <Loading/>;

    if (!trip) return <div className='Trippy'>Trip not found.</div>;

    const defaultCenter: LatLngTuple = [51.505, -0.09];
    const validCoords = [
        pickupCoords,
        dropoffCoords,
        ...logSheetCoords.map(log => log.currentLocationCoords),
        ...logSheetCoords.map(log => log.pickupCoords),
        ...logSheetCoords.map(log => log.dropoffCoords),
        ...logSheetCoords.flatMap(log => log.fuelingStops.map(stop => stop.coords)),
        ...logSheetCoords.flatMap(log => log.restBreakStops.map(stop => stop.coords)),
    ].filter(coord => coord !== null) as Coordinates[];
    const center: LatLngTuple = validCoords.length > 0 ? [validCoords[0].lat, validCoords[0].lon] : defaultCenter;

    const allCoords = validCoords.map(c => [c.lat, c.lon] as LatLngTuple);

    const isHOSViolation = totalCycleHours > 70 && daysSpan <= 8;
  
    const handleIconClick = () => {
        setIsIconSelected((prev) => !prev);
      };

    const validLogSheets = computeValidLogSheets(trip, logSheetCoords, logSheetDistances, driver?.fullName || "Unknown Driver");

    return (


        <div className="ViewTripMainContainer" ref={scrollContainerRef}>

            <div className="ViewTripMainTopnav">

            </div>

            <div className="ViewTripDetailsSectionC">
                <div className="ViewTripDetailTitleC">
                    <p className="ViewTripDetailTitle">{trip.tripTitle}</p>
                </div>
                <div className="ViewTripMainDetailsContainer">
                    <div className="ViewTripMainDetailFieldC">
                        <p className="ViewTripMainDetailFieldTag">Starts</p>
                        <p className="ViewTripMainDetailFieldVal">{trip.pickup}</p>
                    </div>
                    <div className="ViewTripMainDetailFieldC">
                        <p className="ViewTripMainDetailFieldTag">Ends</p>
                        <p className="ViewTripMainDetailFieldVal">{trip.dropoff}</p>
                    </div>
                    {/* <div className="ViewTripMainDetailFieldC">
                        <p className="ViewTripMainDetailFieldTag">Cycle Used</p>
                        <p className="ViewTripMainDetailFieldVal">{trip.cycleUsed} hrs</p>
                    </div>
                    <div className="ViewTripMainDetailFieldC">
                        <p className="ViewTripMainDetailFieldTag">Instructions</p>
                        <p className="ViewTripMainDetailFieldVal">{trip.instructions}</p>
                    </div> */}
                </div>
            </div>

            {isHOSViolation && (
                <div className="ViewTripWarningWinC">
                <p className="ViewTripWarningWinTag" style={{ color: 'red', fontWeight: 'bold' }}>
                    Warning: Total cycle hours ({totalCycleHours.toFixed(2)} hrs) exceed 70-hour limit within 8 days!
                </p>
                </div>
            )}

            <div className="ViewTripRouteMapMainContainer">
                <div className="ViewTripRouteMapContentContainer">

                    <div className="ViewTripRouteMapHeaderC">
                        <p className="ViewTripRouteMapHeader">Route Map</p>
                    </div>

                    <div className={`ViewTripRouteMapDisplayC ${isIconSelected ? 'ViewTripRouteMapDisplayCExp' : ''}`}>

                        {!isIconSelected && (
                        <div className="ViewTripRouteMapDisplayExpandBtnC">
                            <div className="ViewTripRouteMapDisplayExpIconC" onClick={handleIconClick}>
                                <div className="ViewTripRouteMapDisplayExpIconOverL">
                                    <img src='/exp-b.png' alt='' className="ViewTripRouteMapDisplayExpIcon" />
                                </div>
                            </div>
                        </div>
                        )}
                        {isIconSelected && (
                        <div className="ViewTripRouteMapDisplayExpTopToolBC">
                            <div className="ViewTripRouteMapDisplayExpCloseBtnC" onClick={handleIconClick}>
                                <img src='/close-b.png' alt='' className="ViewTripRouteMapDisplayExpCloseBtn" />
                            </div>
                        </div>
                        )}
                        <MapContainer center={center} zoom={5} className={`ViewTripRouteMapDisplay ${isIconSelected ? 'ViewTripRouteMapDisplayExp' : ''}`}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <MapResizeHandler isIconSelected={isIconSelected} />
                            {pickupCoords && (
                                <Marker position={[pickupCoords.lat, pickupCoords.lon]} icon={pickupIcon}>
                                    <Popup>Trip Pickup: {trip.pickup}</Popup>
                                </Marker>
                            )}
                            {dropoffCoords && (
                                <Marker position={[dropoffCoords.lat, dropoffCoords.lon]} icon={dropoffIcon}>
                                    <Popup>Trip Dropoff: {trip.dropoff || 'N/A'}</Popup>
                                </Marker>
                            )}

                            {logSheetCoords.map(log => (
                                <React.Fragment key={log.uniqueId}>

                                    {log.currentLocationCoords && (
                                        <Marker position={[log.currentLocationCoords.lat, log.currentLocationCoords.lon]} icon={currentLocationIcon}>
                                            <Popup>Log Location: {log.currentLocation}</Popup>
                                        </Marker>
                                    )}
                                    {log.pickupCoords && (
                                        <Marker position={[log.pickupCoords.lat, log.pickupCoords.lon]} icon={pickupIcon}>
                                            <Popup>Log Pickup: {log.pickup}</Popup>
                                        </Marker>
                                    )}
                                    {log.dropoffCoords && (
                                        <Marker position={[log.dropoffCoords.lat, log.dropoffCoords.lon]} icon={dropoffIcon}>
                                            <Popup>Log Dropoff: {log.dropoff || 'N/A'}</Popup>
                                        </Marker>
                                    )}

                                    {log.routePaths.map((path, index) => (
                                        path.length > 1 && (
                                            <Polyline
                                            key={`${log.uniqueId}-${index}`}
                                            positions={path}
                                            color={log.warnings.length > 0 ? 'red' : 'blue'}
                                            weight={3}
                                            />
                                        )
                                    ))}
                                    {log.fuelingStops.map((stop, index) => (
                                        <Marker
                                            key={`${log.uniqueId}-fuel-${index}`}
                                            position={[stop.coords.lat, stop.coords.lon]}
                                            icon={fuelingIcon}
                                        >
                                            <Popup>Fueling Stop at {Math.floor(stop.distanceAtStop)} km</Popup>
                                        </Marker>
                                    ))}
                                    {log.restBreakStops.map((stop, index) => (
                                    <Marker
                                        key={`${log.uniqueId}-rest-${index}`}
                                        position={[stop.coords.lat, stop.coords.lon]}
                                        icon={restBreakIcon}
                                    >
                                        <Popup>Rest Break after {stop.drivingHoursAtBreak.toFixed(2)} hrs of driving</Popup>
                                    </Marker>
                                    ))}
                                </React.Fragment>
                            ))}
                            <FitBounds coords={allCoords} />
                        </MapContainer>
                    </div>

                </div>
            </div>

            <div className="ViewTripStopRestMainContainer">
                <div className="ViewTripStopRestHeadersC">
                    <p className="ViewTripStopRestHeaders">Stops &amp; Rests</p>
                </div>
                <div className="ViewTripStopRestLogListContainer">
                    {logSheetCoords.map((log, logIndex) => (
                        <div className="ViewTripStopRestLogUniteContainer" key={logIndex}>
                            <div className="ViewTripStopRestLogHeaderC">
                                <p className="ViewTripStopRestLogHeader">Log Sheet {logIndex + 1}</p>
                            </div>
                            <div className="ViewTripStopRestLogTitleC">
                                <p className="ViewTripStopRestLogTitle">{log.pickup}</p>
                                <p className="ViewTripStopRestLogToTag">to</p>
                                <p className="ViewTripStopRestLogTitle">{log.dropoff}</p>
                                <p className="ViewTripStopRestLogTitle">({log.totalDistance.toFixed(2)} km)</p>
                            </div>
                            <div className="ViewTripStopRestLogInstructionListC">
                                {log.warnings.length > 0 && (
                                    <div className="ViewTripStopRestLogWarningC">
                                    {log.warnings.map((warning, index) => (
                                        <p className="ViewTripStopRestLogWarning" key={index} style={{ color: 'red' }}>
                                        {warning}
                                        </p>
                                    ))}
                                    </div>
                                )}
                                {log.stopInstructions.map((instruction, index) => (
                                    <p className="ViewTripStopRestLogInstructionUnite" key={`${log.uniqueId}-instr-${index}`}>{instruction}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ViewTripLogSheetsMainContainer">
                <div className="ViewTripLogSheetsHeadersC">
                    <p className="ViewTripLogSheetsHeaders">Log Sheets Data</p>
                </div>
                <div className="ViewTripLogShootsGridFlexC">
                    <div className="ViewTripLogSheetsGridContainer">

                        {trip.logSheets && trip.logSheets.length > 0 ? (
                        trip.logSheets.map((log, index) => {
                            const logSheetData = logSheetCoords.find(d => d.uniqueId === log.uniqueId);
                            return (
                        <div className="ViewTripLogSheetDataUniteContainer" key={index}>
                            <div className={`ViewTripLogSheetDataUniteContent ${logSheetData?.warnings?.length && logSheetData.warnings.length > 0 ? 'ViewTripLogSheetDataUniteContentWarning' : ''}`}>

                                {logSheetData && logSheetData.warnings.length > 0 && (
                                    <div className="ViewTripLogSheetDataWarningC">
                                    {logSheetData.warnings.map((warning, index) => (
                                        <p className="ViewTripLogSheetDataWarning" key={index} style={{ color: 'red' }}>
                                        {warning}
                                        </p>
                                    ))}
                                    </div>
                                )}

                                <div className="ViewTripLogSheetDataFieldContainer">
                                    <p className="ViewTripLogSheetDataFieldTag">Current Location</p>
                                    <p className="ViewTripLogSheetDataFieldValue">{log.currentLocation}</p>
                                </div>

                                <div className="ViewTripLogSheetDataFieldContainer">
                                    <p className="ViewTripLogSheetDataFieldTag">Pickup</p>
                                    <p className="ViewTripLogSheetDataFieldValue">{log.pickup}</p>
                                </div>

                                <div className="ViewTripLogSheetDataFieldContainer">
                                    <p className="ViewTripLogSheetDataFieldTag">Dropoff</p>
                                    <p className="ViewTripLogSheetDataFieldValue">{log.dropoff || 'N/A'}</p>
                                </div>

                                <div className="ViewTripLogSheetDataFieldContainer">
                                    <p className="ViewTripLogSheetDataFieldTag">Cycle Used</p>
                                    <p className="ViewTripLogSheetDataFieldValue">{log.currentCycleUsed} hrs</p>
                                </div>

                                <div className="ViewTripLogSheetDataFieldContainer">
                                    <p className="ViewTripLogSheetDataFieldTag">Created Date</p>
                                    <p className="ViewTripLogSheetDataFieldValue">{new Date(log.createdDate).toLocaleString()}</p>
                                </div>
                                <div className="ViewTripLogSheetDataEditBtnC">
                                    <div className="ViewTripLogSheetDataEditBtnIconC" onClick={() => openEditModal(index)}>
                                        <img src='/edit-b.png' alt='' className="ViewTripLogSheetDataEditBtnIcon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                            );
                        })
                    ) : (
                        <p>No log sheets found for this trip.</p>
                    )}

                    <div className="ViewTripLogSheetDattaAddBtnContainer" onClick={openAddModal}>
                        <img src='/plus-g.png' alt='' className='ViewTripLogSheetDataPlusIcon' />
                    </div>

                    </div>
                </div>
                {isAddModalOpen && (
                    <AddLogSheetModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={addLogSheet}
                    />
                )}
                {editModalData && (
                    <LogSheetModal
                    logSheet={editModalData.logSheet}
                    index={editModalData.index}
                    onClose={() => setEditModalData(null)}
                    onSave={handleSaveLogSheet}
                    />
                )}
            </div>

            <div className="ViewTripEldLogMainContainer">
                <div className="ViewTripEldLogHeadersC">
                    <p className="ViewTripEldLogHeaders">ELD Logs</p>
                </div>
                <div className="ViewTripEldLogCanvasListContainer">
                    <div className="ViewTripEldLogCanvasListContent">

                        {validLogSheets.length > 0 ? (
                            <ELDLog logSheets={validLogSheets} tripTitle={trip.tripTitle} />
                        ) : (
                            <p className='ViewTripNA'>No valid ELD log sheets to display.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="ViewTripMainDeleteBtnC">
                <p className="ViewTripMainDeleteBtn" onClick={handleDeleteTrip}>Delete Trip</p>
            </div>

        </div>


    );
}

export default ViewTrip;