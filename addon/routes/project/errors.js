import Route from "@ember/routing/route";

export default class ProjectErrorsRoute extends Route {
  async model({ project_id: projectId }) {
    return {
      projectId,
      instanceId: this.modelFor("application").id,
    };
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.fetchProject.perform();
  }
}
