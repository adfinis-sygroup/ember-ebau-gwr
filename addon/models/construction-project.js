import { tracked } from "@glimmer/tracking";

import BuildingWork from "./building-work";
import Client from "./client";
import ConstructionLocalisation from "./construction-localisation";
import ErrorList from "./error-list";
import RealestateIdentification from "./realestate-identification";
import XMLModel from "./xml-model";

export default class ConstructionProject extends XMLModel {
  @tracked EPROID;
  @tracked officialConstructionProjectFileNo;
  @tracked extensionOfOfficialConstructionProjectFileNo;

  @tracked typeOfClient;
  @tracked typeOfConstruction;
  @tracked typeOfConstructionProject;
  @tracked typeOfPermit;

  @tracked constructionProjectDescription;
  @tracked projectFreeText1;
  @tracked projectFreeText2;
  @tracked totalCostsOfProject;
  @tracked constructionSurveyDeptNumber;

  @tracked withdrawalDate;
  @tracked projectStartDate;
  @tracked constructionAuthorisationDeniedDate;
  @tracked nonRealisationDate;
  @tracked projectCompletionDate;
  @tracked projectSuspensionDate;
  @tracked buildingPermitIssueDate;
  @tracked projectAnnouncementDate;

  @tracked realestateIdentification = new RealestateIdentification();
  @tracked client = new Client();
  @tracked constructionLocalisation = new ConstructionLocalisation();
  @tracked work = [];

  @tracked projectStatus;
  @tracked errorList = [];

  constructor(xmlOrObject, root = "constructionProject") {
    super(xmlOrObject);
    this.setFieldsFromXML({
      root,
      fields: {
        EPROID: Number,
        typeOfClient: Number,
        typeOfConstruction: Number,
        typeOfConstructionProject: Number,
        typeOfPermit: Number,
        totalCostsOfProject: Number,
        officialConstructionProjectFileNo: String,
        extensionOfOfficialConstructionProjectFileNo: String,
        constructionProjectDescription: String,
        constructionSurveyDeptNumber: String,
        withdrawalDate: String,
        projectStartDate: String,
        constructionAuthorisationDeniedDate: String,
        nonRealisationDate: String,
        projectCompletionDate: String,
        projectSuspensionDate: String,
        buildingPermitIssueDate: String,
        projectAnnouncementDate: String,
        projectFreeText1: String,
        projectFreeText2: String,
        projectStatus: Number,
        realestateIdentification: RealestateIdentification,
        client: Client,
        constructionLocalisation: ConstructionLocalisation,
        work: [BuildingWork],
      },
    });

    this.setFieldsFromXML({
      fields: {
        errorList: [ErrorList],
      },
    });

    // Do not show buildingWork which have no building attached
    this.work = this.work.filter(
      (buildingWork) => !buildingWork.building.isNew
    );
  }
  // The order of the fields seems to be important. Sometimes fields in wrong orders throw errors.
  // TODO <work> is until now a fixed value. We need to implement a select for it and display it.
  static template = `
  <ns2:constructionProject>
    <ns2:constructionSurveyDeptNumber>{{model.constructionSurveyDeptNumber}}</ns2:constructionSurveyDeptNumber>
    <ns2:constructionProjectDescription>{{model.constructionProjectDescription}}</ns2:constructionProjectDescription>
    {{> ConstructionLocalisation model=model.constructionLocalisation}}
    {{> RealestateIdentification model=model.realestateIdentification}}
    <ns2:typeOfPermit>{{model.typeOfPermit}}</ns2:typeOfPermit>
    <ns2:typeOfClient>{{model.typeOfClient}}</ns2:typeOfClient>
    {{! this is accepted by the api but in the response the field is missing. Is this intended?}}
    {{> Client model=model.client}}
    <ns2:typeOfConstructionProject>{{model.typeOfConstructionProject}}</ns2:typeOfConstructionProject>
    <ns2:typeOfConstruction>{{model.typeOfConstruction}}</ns2:typeOfConstruction>
    <ns2:totalCostsOfProject>{{model.totalCostsOfProject}}</ns2:totalCostsOfProject>
    <ns2:projectAnnouncementDate>{{echDate model.projectAnnouncementDate}}</ns2:projectAnnouncementDate>

    {{#if model.buildingPermitIssueDate}}
      <ns2:buildingPermitIssueDate>{{echDate model.buildingPermitIssueDate}}</ns2:buildingPermitIssueDate>
    {{/if}}
    {{#if model.projectStartDate}}
      <ns2:projectStartDate>{{echDate model.projectStartDate}}</ns2:projectStartDate>
    {{/if}}
    {{#if model.projectCompletionDate}}
      <ns2:projectCompletionDate>{{echDate model.projectCompletionDate}}</ns2:projectCompletionDate>
    {{/if}}

    {{! These fields are accepted by the api but it seems like theire not actually written.}}
    {{#if model.projectSuspensionDate}}
      <ns2:projectSuspensionDate>{{echDate model.projectSuspensionDate}}</ns2:projectSuspensionDate>
    {{/if}}
    {{#if model.constructionAuthorisationDeniedDate}}
      <ns2:constructionAuthorisationDeniedDate>{{echDate model.constructionAuthorisationDeniedDate}}</ns2:constructionAuthorisationDeniedDate>
    {{/if}}
    {{#if model.withdrawalDate}}
      <ns2:withdrawalDate>{{echDate model.withdrawalDate}}</ns2:withdrawalDate>
    {{/if}}
    {{! this is accepted by the api but in the response the field is missing. Is this intended?}}
    {{#if model.nonRealisationDate}}
      <ns2:nonRealisationDate>{{echDate model.nonRealisationDate}}</ns2:nonRealisationDate>
    {{/if}}

    {{#if model.isNew}}
      {{! TODO}}
      <ns2:work>
        <ns2:kindOfWork>6002</ns2:kindOfWork>
      </ns2:work>

      {{!--
      {{#each model.work}}
        {{> BuildingWork model=this}}
      {{/each}}
      <ns2:work>
        <ns2:kindOfWork>6002</ns2:kindOfWork>
        <ns2:building>
          <ns2:EGID>
            250554
          </ns2:EGID>
        </ns2:building>
      </ns2:work>
      --}}
    {{/if}}
  </ns2:constructionProject>
  `;
}
