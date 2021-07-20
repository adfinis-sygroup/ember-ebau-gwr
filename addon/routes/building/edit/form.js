import Route from "@ember/routing/route";

export default class BuildingFormRoute extends Route {
  model() {
    return this.modelFor("building.edit");
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.fetchBuildingWork.perform();
  }
}
