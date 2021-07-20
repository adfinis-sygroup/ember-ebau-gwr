import { tracked } from "@glimmer/tracking";

import XMLModel from "./xml-model";

export default class ErrorList extends XMLModel {
  @tracked ruleID;
  @tracked ruleCategory;
  @tracked action;
  @tracked messageOfError;

  constructor(...args) {
    super(...args);
    this.setFieldsFromXML({
      fields: {
        ruleID: String,
        ruleCategory: String,
        action: String,
        messageOfError: String,
      },
    });
  }
}
