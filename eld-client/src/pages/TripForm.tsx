import React, { useState, FormEvent, useRef } from 'react';
import '../styles/pagesStyles/TripForm.css'
import { LogSheetData, TripData, createTrip } from '../services/tripServices';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import LogSheetModal from '../components/LogSheetModal';
import AddLogSheetModal from '../components/AddLogSheetModal';

function TripForm() {

    const { driver } = useSelector((state: RootState) => state.auth);
    const submitButtonRef = useRef<HTMLButtonElement | null>(null);

    const [formData, setFormData] = useState<TripData>({
        tripTitle: '',
        pickup: '',
        dropoff: '',
        cycleUsed: '',
        instructions: '',
        email: '',
        logSheets: []
    });

    const [loading, setLoading] = useState(false);

    const [modalData, setModalData] = useState<{ logSheet: LogSheetData | null; index: number | null }>({
        logSheet: null,
        index: null,
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    const addLogSheet = (newLogSheet: LogSheetData) => {
        setFormData((prev) => ({
            ...prev,
            logSheets: [...prev.logSheets, newLogSheet],
        }));
    };

    const openEditModal = (index: number) => {
        setModalData({ logSheet: formData.logSheets[index], index });
    };

    const handleSaveLogSheet = (updatedLogSheet: LogSheetData, index: number) => {
        setFormData((prev) => {
            const updatedLogSheets = [...prev.logSheets];
            updatedLogSheets[index] = updatedLogSheet;
            return { ...prev, logSheets: updatedLogSheets };
        });
    };

    const deleteLogSheet = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            logSheets: prev.logSheets.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (!driver?.email) {
                console.error('Driver email not found');
                return;
            }
            setLoading(true);
            const tripData: TripData = { ...formData, email: driver.email };
            await createTrip(tripData);
            setFormData({ tripTitle: '', pickup: '', dropoff: '', cycleUsed: '', instructions: '', email: '', logSheets: [] });
        } catch (error) {
            console.error('Trip creation failed:', error);
        } finally {
            setLoading(false);
        }
    };


    

    return (

        <div className="TripFormMainPageContainer">
            <div className="TripFormMainPageContentContainer">

                <div className="TripFormMainFormContainer">
                    <form className="TripFormMainFormContentContainer" onSubmit={handleSubmit}>

                        <div className="TripFormFieldContainer">
                            <p className="TripFormFieldTag">Trip Title</p>
                            <input
                                type='text'
                                className="TripFormFieldInput"
                                id="tripTitle" name="tripTitle" value={formData.tripTitle} onChange={handleChange} required 
                            />
                        </div>

                        <div className="TripFormFieldContainer">
                            <p className="TripFormFieldTag">Starts</p>
                            <input
                                type='text'
                                className="TripFormFieldInput"
                                id="pickup" name="pickup" value={formData.pickup} onChange={handleChange} required 
                            />
                        </div>
                        <div className="TripFormFieldContainer">
                            <p className="TripFormFieldTag">Ends</p>
                            <input
                                type='text'
                                className="TripFormFieldInput"
                                id="dropoff" name="dropoff" value={formData.dropoff} onChange={handleChange}
                            />
                        </div>
                        {/* <div className="TripFormFieldContainer">
                            <p className="TripFormFieldTag">Cycle Used in hrs</p>
                            <input
                                type='text'
                                className="TripFormFieldInput"
                                id="cycleUsed" name="cycleUsed" value={formData.cycleUsed} onChange={handleChange} required
                            />
                        </div>
                        <div className="TripFormFieldContainer">
                            <p className="TripFormFieldTag">Instructions</p>
                            <textarea
                                className="TripFormFieldInputTxt"
                                id="instructions" name="instructions" value={formData.instructions} onChange={handleChange}
                            />
                        </div> */}

                        <button type="submit" ref={submitButtonRef} style={{ display: "none" }} >Create Trip</button>
                    </form>

                    <div className="TripFormExternalContentContainer">
                        <div className="TripFormExternalContentAddBtnC">
                            <p className="TripFormExternalContentTag">Log Sheets</p>
                            <div className="TripFormExternalLogSheetaddBtnC" onClick={openAddModal}>
                                <img src='/plus.png' alt='' className="TripFormExternalLSBtnICon" />
                            </div>
                        </div>
                        <div className="TripFormExternalContAddedLogSheetsContainer">
                            {[...formData.logSheets].reverse().map((log, index) => (
                            <div className="TripFormExternalContAddedLogSheetUniteC" key={index}>
                                <div className="TripFormAddedLogCurrLocC">
                                    <p className="TripFormAddedLogCurrLoc">{log.currentLocation}</p>
                                </div>
                                <div className="TripFormAddedLogInfos">
                                    <div className="TripFormAddedLogFieldsC">
                                        <p className="TripFormAddedLogFieldTag">Pickup</p>
                                        <p className="TripFormAddedLogFieldVal">{log.pickup}</p>
                                    </div>
                                    <div className="TripFormAddedLogFieldsC">
                                        <p className="TripFormAddedLogFieldTag">Dropoff</p>
                                        <p className="TripFormAddedLogFieldVal">{log.dropoff}</p>
                                    </div>
                                    <div className="TripFormAddedLogFieldsC">
                                        <p className="TripFormAddedLogFieldTag">Current Cycle Used</p>
                                        <p className="TripFormAddedLogFieldVal">{log.currentCycleUsed} hrs</p>
                                    </div>
                                </div>
                                <div className="TripFormAddedLogLowerControlsC">
                                    <div className="TripFormAddedLogControlBtnC" onClick={() => openEditModal(index)}>
                                        <p className="TripFormAddedLogControlBtn">Edit</p>
                                    </div>
                                    <div className="TripFormAddedLogControlBtnCDel" onClick={() => deleteLogSheet(index)}>
                                        <p className="TripFormAddedLogControlBtnDel">Delete</p>
                                    </div>
                                </div>
                            </div>
                            ))}

                        </div>
                    </div>
                </div>

                <div className="TripFormFixedControlsC">
                    <div className="TripFormFixedControlsContentC">
                        <div className="TripFormExternalBtnC" onClick={() => submitButtonRef.current?.click()}>
                            <p className="TripFormExternalBtn">{loading ? "Creating Trip..." : "Create Trip"} </p>
                        </div>
                    </div>
                </div>

                {modalData.logSheet && (
                    <LogSheetModal
                        logSheet={modalData.logSheet}
                        index={modalData.index}
                        onClose={() => setModalData({ logSheet: null, index: null })}
                        onSave={handleSaveLogSheet}
                    />
                )}

                {isAddModalOpen && (
                    <AddLogSheetModal
                        onClose={() => setIsAddModalOpen(false)}
                        onAdd={addLogSheet}
                    />
                )}

            </div>
        </div>
    );
}

export default TripForm;




