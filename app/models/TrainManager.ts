import { INVALID_DATE, MAX_ACTIVE_TRAINS } from "../utils/constants";
import { TrainRegistry } from "../utils/types";
import { RoutingManager } from "./RoutingManager";
import { Train } from "./Train";


export class TrainManager {
  private trains: { [id: string] : Train } = {}
  private activeTrains: Train[] = []
  private maxActiveTrains: number;
  private lastSelectedDate: Date = INVALID_DATE;
  private routingManager: RoutingManager;

  constructor(routingManager: RoutingManager, maxActiveTrains: number = MAX_ACTIVE_TRAINS) {
      this.routingManager = routingManager;
      this.maxActiveTrains = maxActiveTrains;
  }

  updateTrainData(date: Date, trainData: TrainRegistry) {
    this.lastSelectedDate = date;
    this.trains = {}

    const trainIds = Object.keys(trainData).slice(0, this.maxActiveTrains);
    trainIds.forEach((id) => {
      const train = new Train(id, trainData[id], this.routingManager);
      this.trains[id] = train;
    });

    this.updateActiveTrains(date);
  }

  async updateTrainPositions(time: number) {
    for (const train of this.activeTrains)
      train.updatePosition(time);
  }
 
  updateActiveTrains(date: Date) {
    const day = date.getDay();
    this.activeTrains = Object.values(this.trains).filter((train) => train.isActiveOnDay(day));
  }

  getActiveTrains() {
    return this.activeTrains;
  }

  getTrain(id: string) {
    return this.trains[id];
  }

  getLastSelectedDate() {
    return this.lastSelectedDate;
  }
}
