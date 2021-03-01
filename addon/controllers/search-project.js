import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { task, lastValue } from "ember-concurrency-decorators";
import { projectStatusOptions } from "ember-ebau-gwr/models/options";

export default class SearchProjectController extends Controller {
  @service constructionProject;
  @service intl;
  @service config;
  @service store;

  @tracked extendedSearch = false;
  @tracked validationErrors = {};

  projectStatusOptions = projectStatusOptions;

  // This is ugly state modifying code with side effects. But i didnt know a nicer way.
  validateSearchQuery({ realestateIdentification, modifyDate, createDate }) {
    this.validationErrors = {};
    // Since the api needs a number for the realestateIdentification
    // We have to check that the number is set.
    if (
      (realestateIdentification.EGRID ||
        realestateIdentification.numberSuffix ||
        realestateIdentification.subDistrict ||
        realestateIdentification.lot) &&
      !realestateIdentification.number
    ) {
      this.validationErrors.realestateIdentification = this.intl.t(
        "ember-gwr.searchProject.validation.realestateIdentification"
      );
    }

    // If setting a date filter, both the to and from date have to be set.
    if (
      (modifyDate.dateTo || modifyDate.dateFrom) &&
      !(modifyDate.dateTo && modifyDate.dateFrom)
    ) {
      this.validationErrors.modifyDate = this.intl.t(
        "ember-gwr.searchProject.validation.bothDatesSet"
      );
    }

    if (
      (createDate.dateTo || createDate.dateFrom) &&
      !(createDate.dateTo && createDate.dateFrom)
    ) {
      this.validationErrors.createDate = this.intl.t(
        "ember-gwr.searchProject.validation.bothDatesSet"
      );
    }
    // Return a boolean if there are errors or not
    return Object.keys(this.validationErrors).length;
  }

  @lastValue("search") searchResults;
  @task
  *search(query = {}) {
    // There is only validation needed if the extended filters are used.
    if (this.extendedSearch && this.validateSearchQuery(query)) {
      return;
    }

    query.constructionSurveyDept = this.config.constructionSurveyDept;
    return yield this.constructionProject.search(query);
  }

  @action
  linkProject(eproid) {
    const link = this.store.createRecord("gwr-link", {
      eproid,
      localid: this.model.id,
    });
    link.save();
    this.transitionToRoute("project.index");
  }
}