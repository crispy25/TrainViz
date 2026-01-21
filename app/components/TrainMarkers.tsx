import { Marker, Popup } from "react-leaflet";
import { TrainManager } from "../models/TrainManager";
import { INVALID_COORD } from "../utils/constants";
import { secondsToHM } from "../utils/client-utils";
import "./TrainMarker";

type TrainMarkersProps = {
  trainManager: TrainManager | null;
  setSelectedTrainId: (id: string) => void;
};

export function TrainMarkers({trainManager, setSelectedTrainId}: TrainMarkersProps) {
  return (
    <>
      { trainManager?.getActiveTrains().map((train) => {
          const id = train.getID();
          const trainPosition = train.getPosition() ?? INVALID_COORD;

          if (trainPosition === INVALID_COORD)
            return null;

          const routeStart = train.getStop(0);
          const routeEnd = train.getStop(train.getStopsCount() - 1);
          const nextStop = train.getStop(train.getNextStopIdx());

          return (
            <Marker
              key={id}
              position={[trainPosition[0], trainPosition[1]]}
              eventHandlers={{ click: () => setSelectedTrainId(id) }}
            > 
              <Popup offset={[0, -10]} className="my-popup">
                <span style={{ fontSize: "15px", fontWeight: "bold" }}>🚉 Train {train.toString()}</span><br />
                <span style={{ fontSize: "12px" }}>
                🛤️ Route: {routeStart} - {routeEnd}<br />
                ⏭️ Next Stop: {nextStop}<br />
                🕙 Arrives in: {secondsToHM(train.getSecondsToNextStop())}<br />
                🚄 Speed: {train.getSpeed().toFixed(2)} km/h
                </span>
              </Popup>
            </Marker>
            )
          })
       }
    </>
  );
}
