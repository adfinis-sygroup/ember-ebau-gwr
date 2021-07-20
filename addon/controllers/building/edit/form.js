import Controller from "@ember/controller";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { task, dropTask, lastValue } from "ember-concurrency-decorators";
import Models from "ember-ebau-gwr/models";
import BuildingWorkValidations from "ember-ebau-gwr/validations/building-work";

const EXISTING = 1004,
  NOT_USABLE = 1005;

export default class BuildingFormController extends Controller {
  Models = Models;
  BuildingWorkValidations = BuildingWorkValidations;

  @service constructionProject;
  @service("building") buildingAPI;
  @service intl;
  @service notification;

  @tracked changeStatus = false;
  @tracked errors;

  get buildingStatusOptions() {
    // TODO Every other status need the building to be saved when the project is created.
    return this.model.buildingWork?.isNew
      ? [EXISTING, NOT_USABLE]
      : Models.Building.buildingStatusOptions;
  }

  get nextValidStates() {
    console.log("nextValidStates");
    const states = this.buildingAPI.nextValidStates(this.building.buildingStatus);
    console.log("states:", states);
    return states;
  }

  @lastValue("fetchBuildingWork") buildingWork;
  @task
  *fetchBuildingWork() {
    try {
      if (this.model.buildingWork?.isNew) {
        return this.model.buildingWork;
      }

      const project = yield this.constructionProject.getFromCacheOrApi(
        this.model.projectId
      );

      this.changeStatus = false;
      yield this.fetchBuilding.perform();

      return project.work?.find(
        (buildingWork) =>
          buildingWork.building.EGID === Number(this.model.buildingId)
      );
    } catch (error) {
      console.error(error);
      this.notification.danger(this.intl.t("ember-gwr.linkedBuildings.error"));
    }
  }

  @lastValue("fetchBuilding") building;
  @task
  *fetchBuilding() {
    return yield this.buildingAPI.getFromCacheOrApi(this.model.buildingId);
  }

  @dropTask
  *saveBuildingWork() {
    try {
      let EGID = this.buildingWork.building.EGID;
      if (this.buildingWork.isNew) {
        const building = yield this.buildingAPI.create(
          this.buildingWork.building
        );
        EGID = building.EGID;
      } else {
        yield this.buildingAPI.update(this.buildingWork.building);
      }
      yield this.buildingAPI.bindBuildingToConstructionProject(
        this.model.projectId,
        EGID,
        this.buildingWork
      );
      // Clear cache so after transition we fetch the project form api
      this.constructionProject.clearCache(this.model.projectId);
      this.transitionToRoute("building.edit.form", EGID);
      this.notification.success(this.intl.t("ember-gwr.building.saveSuccess"));
    } catch (error) {
      const errors = JSON.parse(error.message);
      this.errors = [
        ...(errors.error.length || !errors.errorList.length
          ? [this.intl.t("ember-gwr.generalErrors.genericFormError")]
          : []),
        ...errors.errorList.map((error) => error.messageOfError),
      ];
      console.error(error);
      this.notification.danger(this.intl.t("ember-gwr.building.saveError"));
    }
  }

  @dropTask
  *transitionState(newStatus) {
    console.log("transitionState")
    yield this.buildingAPI.transitionState(this.building, newStatus);
    return [];
  }
}
