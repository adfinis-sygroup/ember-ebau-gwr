import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class ProjectController extends Controller {
  @service router;
  @service store;
  @service constructionProject;

  get displayLandingPage() {
    return (
      !this.projects.length &&
      this.router.currentRoute.localName !== "new" &&
      this.router.currentRoute.localName !== "errors"
    );
  }

  get activeProject() {
    return Number(this.router.currentRoute.params.project_id);
  }

  get projects() {
    return this.constructionProject.projects;
  }

  @action
  async onLoad() {
    // We then use `gwr.projects` in the template to reference this.
    // This is so we can update the table if we add a new project in the subroute /new
    const projects = await this.constructionProject.all.perform(this.model);

    // Load the first project in the list if none is selected so we always display a project.
    if (
      !["form", "new", "linked-buildings", "errors"].includes(
        this.router.currentRoute.localName
      ) &&
      projects.length
    ) {
      this.transitionToRoute("project.form", projects[0].EPROID);
    }
  }

  @action
  async removeProjectLink() {
    const link = this.store
      .peekAll("gwr-link")
      .find(({ eproid }) => Number(eproid) === this.activeProject);
    await link.destroyRecord();
    await this.constructionProject.all.perform();
  }
}
