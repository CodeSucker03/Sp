import BaseController from "./Base.controller";

/**
 * @namespace com.sphinxjsc.spbase.controller
 */

export default class NotFound extends BaseController {
  public override onInit(): void {}

  public onPressed() {
    this.getRouter().navTo("RouteMain");
  }
}
