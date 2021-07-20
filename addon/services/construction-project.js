import { task, lastValue } from "ember-concurrency-decorators";
import ConstructionProject from "ember-ebau-gwr/models/construction-project";
import ConstructionProjectsList from "ember-ebau-gwr/models/construction-projects-list";

import GwrService from "./gwr";

export default class ConstructionProjectService extends GwrService {
  cacheKey = "EPROID";
  cacheClass = ConstructionProject;

  static projectStatesMapping = {
    6701: [6702, 6707, 6709, 6708, 6706], // Baugesuch eingereicht
    6702: [6703, 6709, 6708, 6706], // Baubewilligung erteilt (rechtswirksam)
    6703: [6704, 6708, 6706], // Baubegonnen
    6704: [], // Abgeschlossen
    6706: [6701, 6702, 6708, 6703], // Projekt sistiert
    6707: [], // Baugesuch abgelehnt (rechtswirksam)
    6708: [], // Nicht realisiert
    6709: [], // Zurückgezogen
  };

  static projectTransitionMapping = {
    6701: {
      6702: "setToApprovedConstructionProject",
      6707: "setToRefusedConstructionProject",
      6709: "setToCancelledConstructionProject",
      6708: "setToWithdrawnConstructionProject",
      6706: "setToSuspendedConstructionProject",
    },
    6702: {
      6703: "setToStartConstructionProject",
      6709: "setToCancelledConstructionProject",
      6708: "setToWithdrawnConstructionProject",
      6706: "setToSuspendConstructionProject",
    },
    6703: {
      6704: "setToCompletedConstructionProject",
      6708: "setToWithdrawnConstructionProject",
      6706: "setToSuspendConstructionProject",
    },
    6704: {},
    6706: {
      6701: "setToCancelledSuspensionConstructionProject",
      6702: "setToCancelledSuspensionConstructionProject",
      6708: "setToWithdrawnConstructionProject",
      6703: "setToCancelledSuspensionConstructionProject",
    },
    6707: {},
    6708: {},
    6709: {},
  };

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

  nextValidStates(state) {
    return ConstructionProjectService.projectStatesMapping[state];
  }

  async transitionState(project, newState) {
    console.log("status:", project.projectStatus);
    console.log("newState:", newState);
    console.log(
      "transitionState:",
      ConstructionProjectService.projectTransitionMapping[project.projectStatus][
        newState
      ]
    );
    console.log("date:", project.buildingPermitIssueDate);

    const transition =
      ConstructionProjectService.projectTransitionMapping[project.projectStatus][
        newState
      ];
    const body = this.xml.buildXMLRequest(transition, project);
    console.log("body:", body);

    /*const response = await this.authFetch.fetch(
      `/constructionprojects/${project.EPROID}/setToApprovedConstructionProject`,
      {
        method: "put",
        body,
      }
    );*/

    const response = await this.authFetch.fetch(
      `/constructionprojects/${project.EPROID}/${transition}`,
      {
        method: "put",
        body,
      }
    );

    console.log("response:", response);
  }
}
