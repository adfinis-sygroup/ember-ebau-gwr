import Component from "@glimmer/component";

export default class HeaderComponent extends Component {
  get errorCount() {
    return this.args.model?.errorList?.length ?? 0;
  }
}
