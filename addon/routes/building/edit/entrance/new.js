import { inject as service } from "@ember/service";
import BuildingEntrance from "ember-ebau-gwr/models/building-entrance";
import { languageOptions } from "ember-ebau-gwr/models/options";

import IndexRoute from "./edit/index";

export default class BuildingEditEntranceNewRoute extends IndexRoute {
  @service buildingEntrance;
  @service intl;

  templateName = "building.edit.entrance.edit.index";
  controllerName = "building.edit.entrance.edit.index";

  async model() {
    const model = this.modelFor("building.edit");
    // Dont reset if there is already a new record
    if (!this.buildingEntrance.newRecord) {
      this.buildingEntrance.newRecord = new BuildingEntrance();
      this.buildingEntrance.newRecord.locality.name.language =
        languageOptions[this.intl.primaryLocale];
    }
    return { ...model, entranceId: "new" };
  }
}
