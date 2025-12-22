import { MAX_ACTIVE_TRAINS, TRAIN_ALL_WEEK_SERVICE, TRAIN_DEFAULT_NAME } from "../utils/constants";
import { Coord, TrainDynamicDataType, TrainRouteDataType, TrainServiceTimesDataType, TrainStaticDataType } from "../utils/types";
import { RoutingManager } from "./RoutingManager";
import { Train } from "./Train";


export class TrainManager {
  private trainTimes: { [id: number] : Int32Array } = {};
  private trainRoutes: { [id: number] : number } = {};

  private activeTrains: Train[] = []
  private maxActiveTrains: number;

  private routingManager: RoutingManager;

  constructor(routingManager: RoutingManager, maxActiveTrains: number = MAX_ACTIVE_TRAINS) {
      this.routingManager = routingManager;
      this.maxActiveTrains = maxActiveTrains;
  }

  updateTrainData(trainTimes: TrainServiceTimesDataType, trainRoutes: TrainRouteDataType) {
    const activeTrainIds = Object.keys(trainRoutes).slice(1, this.maxActiveTrains); // TODO: Load random trains?
    this.trainTimes = trainTimes;
    this.trainRoutes = trainRoutes;

    this.activeTrains = [];
    activeTrainIds.forEach((idStr) => {
        const id = Number(idStr);
        const routeId = this.trainRoutes[id];
        const routePath = this.routingManager.getRoutePath(routeId);
        const routeStopIds = this.routingManager.getRouteStopIds(routeId);

        if (routePath !== undefined && routeStopIds !== undefined) {
            const train = new Train(id, TRAIN_DEFAULT_NAME, TRAIN_ALL_WEEK_SERVICE, routePath, routeStopIds, this.trainTimes[id]);
            this.activeTrains.push(train);
        }
    });
  }

  async updateTrainPositions(time: number) {
    for (const train of this.activeTrains) {
      if (!train.hasRoute())
        continue;
      train.updatePosition(time);
    }
  }

  getActiveTrains() {
      return this.activeTrains;
  }

  getTrainRouteId(train_id: number) {
      return this.trainRoutes[train_id];
  }
}
