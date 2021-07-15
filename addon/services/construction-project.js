import { task, lastValue } from "ember-concurrency-decorators";
import ConstructionProject from "ember-ebau-gwr/models/construction-project";
import ConstructionProjectsList from "ember-ebau-gwr/models/construction-projects-list";

import GwrService from "./gwr";

export default class ConstructionProjectService extends GwrService {
  cacheKey = "EPROID";
  cacheClass = ConstructionProject;

  async get(EPROID) {
    if (!EPROID) {
      return null;
    }
    const response = await this.authFetch.fetch(
      `/constructionprojects/${EPROID}`
    );
    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async update(project) {
    const body = this.xml.buildXMLRequest("modifyConstructionProject", project);
    const response = await this.authFetch.fetch(
      `/constructionprojects/${project.EPROID}`,
      {
        method: "put",

        body,
      }
    );

    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: modifyConstructionProject failed"
      );

      throw new Error(errors);
    }

    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async create(project) {
    const body = this.xml.buildXMLRequest("addConstructionProject", project);
    const response = await this.authFetch.fetch("/constructionprojects/", {
      method: "post",
      body,
    });

    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: addConstructionProject failed"
      );

      throw new Error(errors);
    }

    const xml = await response.text();
    return this.createAndCache(xml);
  }

  @lastValue("all") projects = [];
  @task
  *all(localId) {
    const links = yield this.store.query("gwr-link", {
      local_id: localId,
    });
    // We make a request for each project here but the probability
    // that there are a lot of linked projects is rather small so this
    // should be okay. Would be a future pain point if this requirement
    // would change.
    const projects = yield Promise.all(
      links.map(({ eproid }) => this.getFromCacheOrApi(eproid))
    );
    return projects;
  }

  async search(query = {}) {
    return super.search(query, query.EPROID, {
      xmlMethod: "getConstructionProject",
      urlPath: "constructionprojects",
      listModel: ConstructionProjectsList,
      listKey: "constructionProject",
      searchKey: "constructionProjectsList",
    });
  }
}
