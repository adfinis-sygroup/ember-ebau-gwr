import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { kindOfWorkOptions } from "ember-ebau-gwr/models/options";

export default class LinkBuildingModalComponent extends Component {
  @tracked buildingWork = {
    constructionWorkDone: kindOfWorkOptions[0],
    energeticRestauration: false,
    renovationHeatingsystem: false,
    innerConversionRenovation: false,
    conversion: false,
    extensionHeighteningHeated: false,
    extensionHeighteningNotHeated: false,
    thermicSolarFacility: false,
    photovoltaicSolarFacility: false,
    otherWorks: false,
  };
  kindOfWorkOptions = kindOfWorkOptions;
}