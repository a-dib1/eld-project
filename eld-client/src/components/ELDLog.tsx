import React, { useRef, useEffect } from 'react';
import '../styles/componentsStyles/ELDLogs.css';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface DutyChange {
  time: number;
  status: number;
}

interface LogSheetData {
  uniqueId: string;
  driverName?: string;
  currentLocation: string;
  pickup: string;
  dropoff?: string;
  createdDate: string;
  currentCycleUsed: string;
  totalDistance: number;
  cycleHours: number;
  stopInstructions: string[];
  segmentDurations: number[];
  offDutyHours: number;      
  sleeperBerthHours: number; 
  drivingHours: number;      
  onDutyHours: number;       
  dutyChanges: DutyChange[];
}

interface ELDLogProps {
  logSheets: LogSheetData[];
  tripTitle: string;
}

const ELDLog: React.FC<ELDLogProps> = ({ logSheets, tripTitle }) => {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const { driver } = useSelector((state: RootState) => state.auth);
  const driverName = driver?.fullName || 'Unknown Driver';

  useEffect(() => {
    logSheets.forEach((log, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dateObj = new Date(log.createdDate);
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const year = dateObj.getFullYear().toString();

      const img = new Image();
      img.src = '/blank-paper-log.png';
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.font = '9px Arial';
        ctx.fillStyle = 'black';

        ctx.fillText(driverName, 330, 78);
        ctx.fillText(month, 185, 17);
        ctx.fillText(day, 225, 17);
        ctx.fillText(year, 263, 17);
        ctx.fillText(log.pickup, 90, 44);
        ctx.fillText(log.dropoff || 'N/A', 275, 44);
        ctx.fillText(`${log.totalDistance.toFixed(2)} mi`, 55, 80);
        ctx.fillText(`${log.cycleHours.toFixed(2)}`, 470, 280);

        ctx.fillText(`${log.offDutyHours.toFixed(2)}`, 468, 200);       
        ctx.fillText(`${log.sleeperBerthHours.toFixed(2)}`, 468, 217);  
        ctx.fillText(`${log.drivingHours.toFixed(2)}`, 468, 234); 
        ctx.fillText(`${log.onDutyHours.toFixed(2)}`, 468, 251);

        const graphStartX = 65; // X starting point (00:00)
        const graphStartY = 198; // Off-Duty Y position
        const rowHeight = 16; // Distance between graph rows
        const graphWidth = 24 * 16; // Total grid width
        const halfHourWidth = graphWidth / 48; // 48 segments (24 hrs * 2 per hr)
        const graphEndX = graphStartX + 24 * halfHourWidth * 2; // End of 24-hour period

        // Start at 6:30 AM (13 half-hour segments: 6 hrs = 12, + 0.5 hr = 1)
        let lastX = graphStartX + 13 * halfHourWidth; // 6:30 AM
        let lastY = graphStartY; // Start at Off Duty

        // Duty Status Row Positions
        const statusYPositions: Record<string, number> = {
          'Off Duty': graphStartY,
          'Sleeper Berth': graphStartY + rowHeight,
          'Driving': graphStartY + rowHeight * 2,
          'On Duty': graphStartY + rowHeight * 3,
        };

        ctx.beginPath();
        ctx.moveTo(graphStartX, statusYPositions['Off Duty']); // Start at 00:00 Off Duty
        ctx.lineTo(lastX, statusYPositions['Off Duty']); // Off Duty until 6:30 AM

        // Process stopInstructions with segmentDurations
        let durationIndex = 0;
        log.stopInstructions.forEach((instruction) => {
          let duration = 0;
          let dutyStatus = 'Driving'; // Default

          if (instruction.includes('Drive')) {
            duration = log.segmentDurations[durationIndex] || 0;
            durationIndex++;
            dutyStatus = 'Driving';
          } else if (instruction.includes('Stop at') || instruction.includes('Fueling')) {
            duration = 0.5; // 30 min for pickup, dropoff, or fueling
            dutyStatus = 'On Duty';
          } else if (instruction.includes('Start at')) {
            return; // Skip "Start at" instruction
          }

          const durationInHalfHours = duration * 2;
          const newX = lastX + durationInHalfHours * halfHourWidth;
          const newY = statusYPositions[dutyStatus];

          if (newY !== lastY) {
            ctx.lineTo(lastX, newY);
          }

          ctx.lineTo(newX, newY);

          lastX = newX;
          lastY = newY;
        });

        // Return to Off Duty until end of day
        if (lastX < graphEndX) {
          ctx.lineTo(lastX, statusYPositions['Off Duty']);
          ctx.lineTo(graphEndX, statusYPositions['Off Duty']);
        }

        ctx.strokeStyle = 'blue';
        ctx.stroke();
      };
    });
  }, [logSheets, tripTitle, driverName]);

  return (
    <div className="LogSheetListGrid">
      {logSheets.map((log, index) => (
        <div key={log.uniqueId} className="LogSheetUniteC">
          <p className="LogSheetUniteHeaders">Log Sheet {index + 1}</p>
          <div className="LogSheetUniteCanvasC">
            <canvas
              ref={(el) => {
                canvasRefs.current[index] = el;
              }}
              className="CanvasMainS"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ELDLog;