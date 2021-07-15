import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { task, dropTask, lastValue } from "ember-concurrency-decorators";
import {
  languageOptions,
  periodOfConstructionOptions,
} from "ember-ebau-gwr/models/options";

export default class SearchBuildingController extends Controller {
  @service building;
  @service intl;
  @service notification;

  @tracked activeBuilding;
  @tracked errors;

  periodOfConstruction = periodOfConstructionOptions;

  @lastValue("search") searchResults;
  @task *search(query) {
    try {
      query.streetLang = languageOptions[this.intl.primaryLocale];
      query.municipality = this.building.municipality;
      return yield this.building.search(query);
    } catch (error) {
      console.error(error);
      this.notification.danger(
        this.intl.t("ember-gwr.generalErrors.searchError")
      );
    }
  }

  @dropTask *linkBuilding(EGID, buildingWork) {
    try {
      yield this.building.bindBuildingToConstructionProject(
        this.model,
        EGID,
        buildingWork
      );
      this.activeBuilding = null;
      this.transitionToRoute("project.linked-buildings", this.model);
      this.notification.success(
        this.intl.t("ember-gwr.searchBuilding.linkSuccess")
      );
    } catch (error) {
      const errors = JSON.parse(error.message);
      this.errors = [
        ...(errors.error.length || !errors.errorList.length
          ? [this.intl.t("ember-gwr.generalErrors.genericFormError")]
          : []),
        ...errors.errorList.map((error) => error.messageOfError),
      ];
      console.error(error);
      this.notification.danger(
        this.intl.t("ember-gwr.searchBuilding.linkError")
      );
    }
  }

  @action
  setActiveBuilding(EGID) {
    this.activeBuilding = EGID;
  }
}
