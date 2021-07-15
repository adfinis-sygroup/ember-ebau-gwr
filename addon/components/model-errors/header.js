import Component from "@glimmer/component";

export default class ModelErrorsHeaderComponent extends Component {
  get errorCount() {
    return this.args.model?.errorList?.length ?? 0;
  }
}
