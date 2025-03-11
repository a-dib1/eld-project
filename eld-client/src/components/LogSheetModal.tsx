import React, { useState, useEffect } from 'react'
import '../styles/componentsStyles/AddLogSheetModal.css'
import { LogSheetData } from '../services/tripServices';

interface LogSheetModalProps {
    logSheet: LogSheetData | null;
    index: number | null;
    onClose: () => void;
    onSave: (updatedLogSheet: LogSheetData, index: number) => void;
}

const LogSheetModal: React.FC<LogSheetModalProps> = ({ logSheet, index, onClose, onSave }) => {
    const [editedLogSheet, setEditedLogSheet] = useState<LogSheetData>({
        currentLocation: '',
        pickup: '',
        dropoff: '',
        currentCycleUsed: '',
    });

    useEffect(() => {
        if (logSheet) {
            setEditedLogSheet(logSheet);
        }
    }, [logSheet]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedLogSheet((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (index !== null) {
            onSave(editedLogSheet, index);
        }
        onClose();
    };

    return (

        <div className="LogSheetMainModalContainer">
            <div className="LogSheetMainModalContentC">

                <div className="LogSheetMainModalCloseBtnC" onClick={onClose}>
                    <div className="LogSheetMainModalCloseBtnH">
                        <img src='/close-b.png' alt='' className="LogSheetMainModalCloseBtn" />
                    </div>
                </div>

                <div className="LogSheetMainModalContent">
                    <div className="LogSheetFormModalContainer">
                        <div className="LogSheetFormHeadersTagC">
                            <p className="LogSheetFormHeadersTag">Edit Log Sheet</p>
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Current Locations</p>
                            <input className="LogSheetFormInput" type="text" name="currentLocation" value={editedLogSheet.currentLocation} onChange={handleChange} required />
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Pickup</p>
                            <input className="LogSheetFormInput" type="text" name="pickup" value={editedLogSheet.pickup} onChange={handleChange} required />
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Dropoff</p>
                            <input className="LogSheetFormInput" type="text" name="dropoff" value={editedLogSheet.dropoff} onChange={handleChange} />
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Current Cycle Used</p>
                            <input className="LogSheetFormInput" type="text" name="currentCycleUsed" value={editedLogSheet.currentCycleUsed} onChange={handleChange} required />
                        </div>
                        <div className="LogSheetFormLowerBarC">
                            <div className="LogSheetFormSubmitBtnC" onClick={handleSave}>
                                <p className="LogSheetFormSubmitBtn">Save Changes</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LogSheetModal;
