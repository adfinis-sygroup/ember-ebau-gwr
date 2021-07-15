import { inject as service } from "@ember/service";
import Building from "ember-ebau-gwr/models/building";
import BuildingsList from "ember-ebau-gwr/models/buildings-list";

import GwrService from "./gwr";

export default class BuildingService extends GwrService {
  @service constructionProject;
  cacheKey = "EGID";
  cacheClass = Building;

  async unbindBuildingFromConstructionProject(EPROID, EGID) {
    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/unbindToConstructionProject/${EPROID}`,
      {
        method: "put",
      }
    );
    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: unbindBuildingFromConstructionProject failed"
      );

      throw new Error(errors);
    }
    // Refresh cache after removing the building
    /* eslint-disable-next-line ember/classic-decorator-no-classic-methods */
    await this.constructionProject.get(EPROID);
  }

  async bindBuildingToConstructionProject(EPROID, EGID, buildingWork) {
    const body = this.xml.buildXMLRequest("bindBuildingToConstructionProject", {
      EPROID,
      EGID,
      buildingWork,
    });
    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/bindToConstructionProject`,
      {
        method: "put",
        body,
      }
    );
    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: bindBuildingToConstructionProject failed"
      );

      throw new Error(errors);
    }
    // Update cache
    /* eslint-disable-next-line ember/classic-decorator-no-classic-methods */
    this.constructionProject.get(EPROID);

    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async update(building) {
    const body = this.xml.buildXMLRequest("modifyBuilding", building);
    const response = await this.authFetch.fetch(`/buildings/${building.EGID}`, {
      method: "put",

      body,
    });

    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: modifyBuilding failed"
      );

      throw new Error(errors);
    }

    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async create(building) {
    const body = this.xml.buildXMLRequest("addBuilding", building);
    const response = await this.authFetch.fetch("/buildings/", {
      method: "post",
      body,
    });

    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: addBuilding failed"
      );

      throw new Error(errors);
    }

    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async get(EGID) {
    if (!EGID) {
      return null;
    }
    const response = await this.authFetch.fetch(`/buildings/${EGID}`);
    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async search(query = {}) {
    return super.search(query, query.EGID, {
      xmlMethod: "getBuilding",
      urlPath: "buildings",
      listModel: BuildingsList,
      listKey: "building",
      searchKey: "buildingsList",
    });
  }
}
