import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { dropTask } from "ember-concurrency-decorators";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default class HeaderComponent extends Component {
  @service intl;
  
  @tracked newStatus;
  @tracked errors = [];

  get errorCount() {
    return this.args.model?.errorList?.length ?? 0;
  }

  get modelStatus() {
    return this.args.model?.[this.args.modelName + "Status"];
  }

  /*@action
  changeStatus(event) {
    console.log("event:", event);
    this.newStatus = event.target.value;
    console.log("this.newStatus:", this.newStatus);
  }*/

  @dropTask
  *checkValidity(isChange) {
    console.log("checkValidity isChange:", isChange);
    if (!this.newStatus) {
      this.newStatus = this.modelStatus;
    }

    console.log("newStatus:", this.newStatus);

    if (isChange && !this.args.nextValidStates.includes(this.newStatus)) {
      console.log("invalid state:", this.args.nextValidStates);
      console.log(
        "includes:",
        this.args.nextValidStates.includes(this.newStatus)
      );
      this.errors = ["Neuer Status muss eine zulässige Statusänderung sein."];
      return;
    }

    console.log("checking state validity");
    this.errors = isChange
      ? this.args.onStatusChange.perform(this.newStatus)
      : this.args.onStatusCorrection.perform(this.newStatus);
    
    console.log("this.errors:", this.errors);
  }

  get statusOptions() {
    return this.args.modelStatusOptions.map((option) => ({
      status: option,
      label: this.intl.t(
        "ember-gwr.lifeCycles." +
          this.args.modelName +
          ".statusOptions." +
          option
      ),
    }));
  }
}
