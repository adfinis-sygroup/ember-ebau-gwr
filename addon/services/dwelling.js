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

  static dwellingStatesMapping = {
    3001: [3002, 3008], // Projektiert
    3002: [3003, 3008], // Bewilligt
    3003: [3008, 3004, 3005], // Im Bau
    3004: [3007], // Bestehend
    3005: [3004, 3007], // Nicht nutzbar
    3007: [], // Aufgehoben
    3008: [], // Nicht realiziert
  };

  static dwellingTransitionMapping = {
    3001: {
      3002: "setToApprovedConstructionProject", // set dwellings to approve on construction project?
      3008: "setToNotRealizedDwelling",
    },
    3002: {
      3003: "setToDwellingConstructionStarted",
      3008: "setToNotRealizedDwelling",
    },
    3003: {
      3008: "setToNotRealizedDwelling",
      3004: "setToCompleteDwelling",
      3005: "setToUnusableDwelling",
    },
    3004: {
      3007: "setToDemolishDwelling",
    },
    3005: {
      3004: "setToCompleteDwelling",
      3007: "setToDemolishDwelling",
    },
    3007: {},
    3008: {},
  };

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

  nextValidStates(state) {
    return DwellingService.dwellingStatesMapping[state];
  }

  async transitionState(dwelling, newState, EGID) {
    console.log("status:", dwelling.dwellingStatus);
    console.log("newState:", newState);
    console.log(
      "transitionState:",
      DwellingService.dwellingTransitionMapping[dwelling.dwellingStatus][newState]
    );

    const transition = DwellingService.dwellingTransitionMapping[dwelling.dwellingStatus][newState];
    const body = this.xml.buildXMLRequest(
      transition,
      dwelling
    );
    console.log("body:", body);
    
    /*const response = await this.authFetch.fetch(
      `/constructionprojects/${project.EPROID}/setToApprovedConstructionProject`,
      {
        method: "put",
        body,
      }
    );*/

    const response = await this.authFetch.fetch(
      `/buildings/${EGID}/dwellings/${dwelling.EWID}/${transition}`,
      {
        method: "put",
        body,
      }
    );
  }
}
