import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import { lastValue, restartableTask } from "ember-concurrency-decorators";

export default class ProjectErrorsController extends Controller {
  @service constructionProject;
  @service building;
  @service buildingEntrance;
  @service dwelling;
  @service intl;
  @service notification;

  getErrorCount(modelList, path) {
    let models = modelList;
    if (typeof modelList === "object") {
      models = Object.values(modelList).flat();
    }

    return models
      .map(
        (model) =>
          (path ? model[path].errorList?.length : model.errorList?.length) ?? 0
      )
      .reduce((a, b) => a + b, 0);
  }

  get totalErrorCount() {
    if (!this.project) {
      return 0;
    }

    const errors =
      (this.project.errorList?.length ?? 0) +
      this.getErrorCount(this.buildings) +
      this.getErrorCount(this.entrances) +
      this.getErrorCount(this.dwellings, "dwelling");
    return errors;
  }

  @lastValue("fetchProject") project;
  @restartableTask
  *fetchProject() {
    const project = yield this.constructionProject.getFromCacheOrApi(
      this.model.projectId
    );
    const buildings = yield this.fetchBuildings.perform(project);

    const entrances = this.fetchEntrances.perform(buildings);
    const dwellings = this.fetchDwellings.perform(buildings);

    yield entrances;
    yield dwellings;

    return project;
  }

  @lastValue("fetchBuildings") buildings;
  @restartableTask
  *fetchBuildings(project) {
    return yield Promise.all(
      project.work.map((buildingWork) =>
        this.building.getFromCacheOrApi(buildingWork.building.EGID)
      )
    );
  }

  @lastValue("fetchEntrances") entrances;
  @restartableTask
  *fetchEntrances(buildings) {
    const entrances = {};
    buildings.map((building) => {
      entrances[building.EGID] = Promise.all(
        building.buildingEntrance.map((entrance) =>
          this.buildingEntrance.getFromCacheOrApi(entrance.EDID, building.EGID)
        )
      );
      return entrances[building.EGID];
    });

    yield Promise.all(
      Object.entries(entrances).map(async ([key, value]) => {
        entrances[key] = await value;
      })
    );

    return entrances;
  }

  @lastValue("fetchDwellings") dwellings;
  @restartableTask
  *fetchDwellings(buildings) {
    const dwellings = {};
    buildings.map((building) =>
      building.buildingEntrance.map((entrance) => {
        dwellings[building.EGID] = Promise.all(
          entrance.dwelling.map((dwelling) =>
            this.dwelling.getFromCacheOrApi(dwelling.EWID, building.EGID)
          )
        );
        return dwellings[building.EGID];
      })
    );

    yield Promise.all(
      Object.entries(dwellings).map(async ([key, value]) => {
        dwellings[key] = await value;
      })
    );

    return dwellings;
  }
}
