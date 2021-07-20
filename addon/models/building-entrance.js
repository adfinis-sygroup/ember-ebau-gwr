import { tracked } from "@glimmer/tracking";

import Coordinates from "./coordinates";
import Dwelling from "./dwelling";
import ErrorList from "./error-list";
import LocalId from "./local-id";
import Locality from "./locality";
import Street from "./street";
import XMLModel from "./xml-model";

export default class BuildingEntrance extends XMLModel {
  @tracked EDID;
  @tracked EGID;
  @tracked EGAID;
  @tracked buildingEntranceNo;
  @tracked coordinates = new Coordinates();
  @tracked isOfficialAddress = false;
  @tracked localId = new LocalId();
  @tracked street = new Street();
  @tracked locality = new Locality();
  @tracked dwelling = [];

  @tracked errorList = [];

  constructor(xmlOrObject, root = "buildingEntrance") {
    super(xmlOrObject);
    this.setFieldsFromXML({
      root,
      fields: {
        EDID: Number,
        EGID: Number,
        EGAID: Number,
        buildingEntranceNo: String,
        isOfficialAddress: Boolean,
        street: Street,
        locality: Locality,
        coordinates: Coordinates,
        dwelling: [Dwelling],
      },
    });

    this.setFieldsFromXML({
      fields: {
        errorList: [ErrorList],
      },
    });
  }

  get fullAddressText() {
    const { street, buildingEntranceNo, locality } = this;
    return `${street?.description.descriptionLong ?? ""} ${
      buildingEntranceNo ?? ""
    }, ${locality.swissZipCode ?? ""} ${locality.name.nameLong ?? ""}`;
  }

  static template = `
  {{#if model.isNew}}
    {{#if model.buildingEntranceNo}}
      <ns2:buildingEntranceNo>{{model.buildingEntranceNo}}</ns2:buildingEntranceNo>
    {{/if}}
    <ns2:isOfficialAddress>{{model.isOfficialAddress}}</ns2:isOfficialAddress>
    {{> Street model=model.street}}
    {{> Locality model=model.locality}}
  {{else}}
    <ns2:buildingEntrance>
      <ns2:EGAID>{{model.EGAID}}</ns2:EGAID>
      <ns2:buildingEntranceNo>{{model.buildingEntranceNo}}</ns2:buildingEntranceNo>
      <ns2:isOfficialAddress>{{model.isOfficialAddress}}</ns2:isOfficialAddress>
      {{> Street model=model.street}}
      {{> Locality model=model.locality}}
      {{! This is not wokrking for some reason}}
      {{!> Coordinates model=model.coordinates}}
    </ns2:buildingEntrance>
  {{/if}}
  `;
}
