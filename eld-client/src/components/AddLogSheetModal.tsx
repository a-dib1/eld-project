import React, { useState } from 'react';
import '../styles/componentsStyles/AddLogSheetModal.css'
import { LogSheetData } from '../services/tripServices';

interface AddLogSheetModalProps {
    onClose: () => void;
    onAdd: (newLogSheet: LogSheetData) => void;
}

const AddLogSheetModal: React.FC<AddLogSheetModalProps> = ({ onClose, onAdd }) => {
    const [newLogSheet, setNewLogSheet] = useState<LogSheetData>({
        currentLocation: '',
        pickup: '',
        dropoff: '',
        currentCycleUsed: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewLogSheet((prev) => ({ ...prev, [name]: value }));
    };

    const handleAdd = () => {
        onAdd(newLogSheet);
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
                            <p className="LogSheetFormHeadersTag">Add Log Sheet</p>
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Current Locations</p>
                            <input className="LogSheetFormInput" type="text" name="currentLocation" value={newLogSheet.currentLocation} onChange={handleChange} required />
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Pickup</p>
                            <input className="LogSheetFormInput" type="text" name="pickup" value={newLogSheet.pickup} onChange={handleChange} required />
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Dropoff</p>
                            <input className="LogSheetFormInput" type="text" name="dropoff" value={newLogSheet.dropoff} onChange={handleChange} />
                        </div>
                        <div className="LogSheetFormInputContainer">
                            <p className="LogSheetFormInputTag">Current Cycle Used</p>
                            <input className="LogSheetFormInput" type="text" name="currentCycleUsed" value={newLogSheet.currentCycleUsed} onChange={handleChange} required />
                        </div>
                        <div className="LogSheetFormLowerBarC">
                            <div className="LogSheetFormSubmitBtnC" onClick={handleAdd}>
                                <p className="LogSheetFormSubmitBtn">Add Log Sheet</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AddLogSheetModal;
