import { guidFor } from "@ember/object/internals";
import { inject as service } from "@ember/service";
import Dwelling, { DwellingComplete } from "ember-ebau-gwr/models/dwelling";

import GwrService from "./gwr";

export default class DwellingService extends GwrService {
  @service building;

  cacheKey(dwelling) {
    return `${guidFor(dwelling)}-${dwelling.EWID}`;
  }
  cacheClass = Dwelling;

  async get(EWID, EGID) {
    if ((!EWID && EWID !== 0) || !EGID) {
      return null;
    }
    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/dwellings/${EWID}`
    );
    const xml = await response.text();
    const dwellingComplete = new DwellingComplete(xml);
    this.cache(dwellingComplete.dwelling);

    dwellingComplete.dwelling.EDID = dwellingComplete.EDID;

    return dwellingComplete;
  }

  async update(dwelling, EGID) {
    const body = this.xml.buildXMLRequest(
      "modifyDwelling",
      dwelling,
      "Update dwelling"
    );
    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/dwellings/${dwelling.EWID}`,
      {
        method: "put",
        body,
      }
    );

    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: modifyDwelling failed"
      );

      throw new Error(errors);
    }

    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async reallocate(EGID, dwelling) {
    const body = this.xml.buildXMLRequest(
      "reallocateDwelling",
      { newEDID: dwelling.EDID, oldEDID: dwelling.oldEDID },
      "Reallocate dwelling"
    );
    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/dwellings/${dwelling.EWID}/reallocate`,
      {
        method: "put",
        body,
      }
    );

    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: reallocateDwelling failed"
      );

      throw new Error(errors);
    }
  }

  async create(dwelling, EGID) {
    const body = this.xml.buildXMLRequest(
      "addDwelling",
      dwelling,
      "Add dwelling"
    );
    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/entrance/${dwelling.EDID}/dwellings/work`,
      {
        method: "post",
        body,
      }
    );

    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: addDwelling failed"
      );

      throw new Error(errors);
    }

    // Refresh building cache after adding a dwelling
    /* eslint-disable-next-line ember/classic-decorator-no-classic-methods */
    await this.building.get(EGID);

    const xml = await response.text();
    return this.createAndCache(xml);
  }

  async deactivate(EGID, EWID) {
    const body = this.xml.buildXMLRequest(
      "deactivateDwelling",
      null,
      "Remove Dwelling"
    );
    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/dwellings/${EWID}`,
      {
        method: "delete",
        body,
      }
    );
    if (!response.ok) {
      const xmlErrors = await response.text();
      const errors = this.extractErrorsFromXML(
        xmlErrors,
        "GWR API: deactivateDwelling failed"
      );

      throw new Error(errors);
    }
    // Refresh cache after removing the building
    /* eslint-disable-next-line ember/classic-decorator-no-classic-methods */
    await this.building.get(EGID);
  }
}
