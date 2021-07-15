import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { task, dropTask, lastValue } from "ember-concurrency-decorators";
import Options from "ember-ebau-gwr/models/options";
import ConstructionProjectValidations from "ember-ebau-gwr/validations/construction-project";

export default class ProjectFormController extends Controller {
  queryParams = ["import"];
  ConstructionProjectValidations = ConstructionProjectValidations;

  @service constructionProject;
  @service config;
  @service dataImport;
  @service store;
  @service router;
  @service intl;
  @service notification;

  @tracked import = false;
  @tracked isOrganisation;
  @tracked errors;

  choiceOptions = Options;

  get currentRoute() {
    return this.router.currentRouteName;
  }

  @lastValue("fetchProject") project;
  @task
  *fetchProject() {
    const project = this.model.project?.isNew
      ? this.model.project
      : yield this.constructionProject.getFromCacheOrApi(this.model.projectId);
    this.isOrganisation = project.client.identification.isOrganisation;
    return project;
  }

  @lastValue("fetchCalumaData") importData;
  @task
  *fetchCalumaData() {
    return yield this.dataImport.fetchProject(this.model.instanceId);
  }

  @action
  importCalumaData() {
    // We cannot just `Object.assign` here since the child object like `identification` would
    // not be classes with tracked fields etc. anymore but just pojos. We need to preserve the classes.
    const deepMerge = (original, objectToApply) => {
      Object.entries(objectToApply).forEach(([key, value]) => {
        typeof value === "object"
          ? deepMerge(original[key], objectToApply[key])
          : (original[key] = value);
      });
    };
    deepMerge(this.project, this.importData);
  }

  @action
  cancelMerge() {
    this.import = false;
    this.fetchProject.perform();
  }

  @dropTask
  *saveProject() {
    try {
      if (this.project.isNew) {
        const project = yield this.constructionProject.create(this.project);
        const link = this.store.createRecord("gwr-link", {
          eproid: project.EPROID,
          localId: this.model.instanceId,
        });
        yield link.save();
        // Reload the overview table to display the new project
        yield this.constructionProject.all.perform(this.model.instanceId);
        this.transitionToRoute("project.form", project.EPROID);
      } else {
        yield this.constructionProject.update(this.project);
      }
      this.import = false;
      this.notification.success(
        this.intl.t("ember-gwr.constructionProject.saveSuccess")
      );
    } catch (error) {
      const errors = JSON.parse(error.message);
      this.errors = [
        ...(errors.error.length || !errors.errorList.length
          ? [this.intl.t("ember-gwr.generalErrors.genericFormError")]
          : []),
        ...errors.errorList.map((error) => error.messageOfError),
      ];
      console.log(error); // eslint-disable-line no-console
      this.notification.danger(
        this.intl.t("ember-gwr.constructionProject.saveError")
      );
    }
  }
}
