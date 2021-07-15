import { action } from "@ember/object";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

export default class HeaderComponent extends Component {
  @tracked errorIndex = 0;

  @action
  updateCurrentIndex() {
    if (this.args.errors.length) {
      this.errorIndex = (this.errorIndex + 1) % this.args.errors.length;
    }
  }
}
