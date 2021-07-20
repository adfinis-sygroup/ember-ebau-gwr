import { tracked } from "@glimmer/tracking";

import XMLModel from "./xml-model";

export default class Address extends XMLModel {
  @tracked street;
  @tracked houseNumber;
  @tracked swissZipCode;
  @tracked town;
  @tracked country;

  constructor(...args) {
    super(...args);
    this.setFieldsFromXML({
      fields: {
        street: String,
        houseNumber: Number,
        swissZipCode: Number,
        town: String,
        country: String,
      },
    });
  }

  static template = `
  <address>
    <ns5:street>{{model.street}}</ns5:street>
    <ns5:houseNumber>{{model.houseNumber}}</ns5:houseNumber>
    <ns5:town>{{model.town}}</ns5:town>
    {{#if model.swissZipCode}}
      <ns5:swissZipCode>{{model.swissZipCode}}</ns5:swissZipCode>
    {{/if}}
    <ns5:country>
      <ns5:countryNameShort>{{model.country}}</ns5:countryNameShort>
    </ns5:country>
  </address>
  `;
}
