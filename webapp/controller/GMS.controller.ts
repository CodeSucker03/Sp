import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Button, { type Button$PressEvent } from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import HBox from "sap/m/HBox";
import type Input from "sap/m/Input";
import type { InputBase$ChangeEvent } from "sap/m/InputBase";
import type Label from "sap/m/Label";
import { DialogType } from "sap/m/library";
import type { Link$PressEvent } from "sap/m/Link";
import MessageBox from "sap/m/MessageBox";
import Panel from "sap/m/Panel";
import TextArea from "sap/m/TextArea";
import VBox from "sap/m/VBox";
import { ValueState } from "sap/ui/core/library";
import type View from "sap/ui/core/mvc/View";
import type { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import type Router from "sap/ui/core/routing/Router";
import type UIComponent from "sap/ui/core/UIComponent";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ObjectPageLayout from "sap/uxap/ObjectPageLayout";
import type ObjectPageSection from "sap/uxap/ObjectPageSection";
import Component from "../Component";
import type { ODataResponse, ODataResponses } from "../types/odata";
import Base from "./Base.controller";
import type { ListBase$ItemPressEvent } from "sap/m/ListBase";
import { ServiceUrls } from "base/model/models";
import type { IGMSArgs, NCCExistsInfo, NewNCCFileList } from "base/types/pages/main";

export default class GMS extends Base {
  private view: View;
  private component: Component;
  private resourceBundle: ResourceBundle;

  private dialogGui: Dialog;
  private dialogDongThuan: Dialog;
  private dialogPheDuyet: Dialog;
  private oUploadDialog: Dialog;

  private WorkflowId: string;
  private Mancc: string;
  private Status: string;
  private UserName: string;
  private router: Router;
  private checkButton: boolean = false;

  public override onInit() {
    super.onInit();
    this.getRouter().getRoute("RouterGMS")?.attachMatched(this._onRouteMatched, this);

    this.view = <View>this.getView();
    this.component = <Component>this.getOwnerComponent();
    this.router = (<UIComponent>this.getOwnerComponent()).getRouter();
    this.resourceBundle = this.getResourceBundle();

    this.setModel(
      new JSONModel({
        thongTinDangky: {},
        loaiHangHoa: [],
        danhSachDangKyKinhDoanh: [],
        danhSachHopDong: [],
        danhSachGiaiThuong: [],
        danhSachHoSo: [],
        baoCaoTaiChinh: [],
        trangThaiPheDuyet: [],
        lichSuPheDuyet: [],
        LichSuCungUng: [
          {
            Magms: "GMS24.10.01.001",
            Tenncc: "abc",
            htms: "đấu thầu",
            htmhs: "Mở 1 gói hồ sơ",
            ptms: "phức tạp",
            diem: "1",
            giaTri: "100000vnd",
            ngay: "01.05.2024",
            trangThai: "hoan thành",
            Mancc: "0010000002",
          },
        ],
        objectKey: "",
        yKienPheDuyet: "",
        checkTaoTaiKhoan: {},
        checkButtonTaoTaiKhoan: false,
        wiid: false,
      }),
      "detailNCC"
    );

    if (!this.oUploadDialog) {
      this.getFormFragment("Upload")
        .then((oDialog: any) => {
          this.view.addDependent(oDialog);
          this.oUploadDialog = oDialog;
        })
        .catch((error: Error) => {
          console.log(error);
        });
    }

    // await this.dataLoaded; ?
  }

  // public getStatus(status: string): ValueState {
  //   if (status === "đã huỷ") {
  //     return ValueState.Error;
  //   }

  //   return ValueState.None;
  // }

  // #region routematch?
  private _onRouteMatched = (event: Route$MatchedEvent) => {
    const Args = <IGMSArgs>event.getParameter("arguments");

    const url = window.location.href;

    const WorkitemId = url.split("&/WorkitemId=")[1];

    const Status = Args?.Status ?? "";
    const UserName = Args?.UserName ?? "";

    const lichSuPheDuyet = this.getControlById<ObjectPageSection>("lichSuPheDuyet");
    const LichSuCungUng = this.getControlById<ObjectPageSection>("LichSuCungUng");
    const thongTinPheDuyet = this.getControlById<ObjectPageSection>("thongTinPheDuyet");

    const taoTaiKhoanUser = this.getControlById<Panel>("taoTaiKhoanUser");
    const buttonTaoTaiKhoan = this.getControlById<HBox>("buttonStart");

    this.WorkflowId = WorkitemId;
    this.Status = Status;
    this.UserName = UserName;

    switch (Status) {
      case "chuaDuyet":
        if (this.WorkflowId) {
          thongTinPheDuyet.setVisible(true);
        } else {
          buttonTaoTaiKhoan.setVisible(true);
        }
        lichSuPheDuyet.setVisible(true);
        taoTaiKhoanUser.setVisible(true);
        LichSuCungUng.setVisible(false);

        break;

      case "daDuyet":
        lichSuPheDuyet.setVisible(false);
        thongTinPheDuyet.setVisible(false);
        LichSuCungUng.setVisible(false);
        taoTaiKhoanUser.setVisible(false);
        break;

      default:
        lichSuPheDuyet.setVisible(false);
        LichSuCungUng.setVisible(true);
        thongTinPheDuyet.setVisible(false);
        taoTaiKhoanUser.setVisible(false);
        break;
    }

    // await this.dataLoaded; ???

    this.getThongTinDangKy();
    this.lichSuPheDuyet();
    this.trangThaiPheDuyet();
    this.getLoaiHangHoa();
    this.getFile();
  };

  public override onExit(): void | undefined {}

  public onRefresh() {}

    // #region get data

  private getThongTinDangKy() {
    const model = this.getModel("detailNCC");
    const label = this.getControlById<Label>("labelCheckTaiKhoan");

    let path = "";
    if (this.Status === "chuaDuyet") {
      path = `/NewNCCSet('${this.UserName}')`;
    } else {
      path = `/NCCExistsInfoSet('${this.UserName}')`;
    }

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      // fix to response since both have Mancc
      success: (repsonse: ODataResponse<NCCExistsInfo>) => {
        if (repsonse.Mancc) {
          label.setText(`Mã số thuế này đã là NCC hiện hữu trên 
            hệ thống SAP ___ - Mã NCC: ${repsonse.Mancc}`);
          label.setDesign("Bold");
        } else {
          label.setVisible(false);
        }

        model.setProperty("/thongTinDangKy", repsonse);
        model.refresh();
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }

  //
  private getLoaiHangHoa() {
    const path = "/NCCMaterialSet";
    const model = this.getModel("detailNCC");
    const filters: Filter[] = [new Filter("Username", FilterOperator.EQ, this.UserName)];

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filters,
      success: (repsonse: ODataResponses) => {
        model.setProperty("/loaiHangHoa", repsonse.results);
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }


  private getFile() {
    const model = this.getModel("detailNCC");
    const path = "/NewNCCFileListSet";
    const filter: Filter[] = [new Filter("Username", FilterOperator.EQ, this.UserName)];
    const arr1: any = [];
    const arr2: any = [];
    const arr3: any = [];
    const arr4: any = [];
    const arr5: any = [];

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filter,
      success: (response: ODataResponses) => {
        const data = <NewNCCFileList[]>response.results;

        data.forEach((item: any) => {
          switch (item.Filetype) {
            case "1":
              arr1.push(item);
              break;
            case "2":
              arr2.push(item);
              break;
            case "3":
              arr3.push(item);
              break;
            case "4":
              arr4.push(item);
              break;
            case "5":
              arr5.push(item);
              break;
            default:
              break;
          }
        });
        model.setProperty("/danhSachDangKyKinhDoanh", arr1);
        model.setProperty("/danhSachHopDong", arr2);
        model.setProperty("/danhSachGiaiThuong", arr3);
        model.setProperty("/danhSachHoSo", arr4);
        model.setProperty("/baoCaoTaiChinh", arr5);
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }

  // No odata yet
  private lichSuPheDuyet() {
    const path = "/NewNCCWFLogSet";
    const model = this.getModel("detailGMS");
    const filter: Filter[] = [new Filter("Username", FilterOperator.EQ, this.UserName)];

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filter,
      success: (repsonse: ODataResponses) => {
        model.setProperty("/lichSuPheDuyet", repsonse.results);
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }

  private lichSuDonHang() {
    const model = this.getModel("detailNCC");

    const path = "/GMSNCCEXists";
    const filter: Filter[] = [new Filter("Username", FilterOperator.EQ, this.UserName)];

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filter,
      success: (response: ODataResponses) => {
        model.setProperty("/LichSuCungUng", response.results);
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }

  private trangThaiPheDuyet() {
    const model = this.getModel("detailNCC");
    const path = "/WFCheckSet";

    const filters = [
      new Filter("Username", FilterOperator.EQ, this.UserName),
      new Filter("Wiid", FilterOperator.EQ, this.WorkflowId),
    ];

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.setUseBatch(false);
    oDataModel5.read(path, {
      filters: filters,
      success: (response: ODataResponses) => {
        model.setProperty("/trangThaiPheDuyet", response.results);
      },
      error: (error: Error) => {
        console.log(error);
      },
    });
  }

  public onChangeValue(event: InputBase$ChangeEvent) {
    const model = this.getModel("detailNCC");
    const input = this.getControlById<Input>("inputPheDuyet");
    const value = event.getSource().getValue();
    model.setProperty("/yKienPheDuyet", value);

    if (!value) {
      input.setValueState("Error");
      input.setValueStateText("this fied is required");
    } else {
      input.setValueState("None");
    }
  }

  public popUpPheDuyet(btn: string, index: number, dialog: Dialog) {
    const path = "/PROCESS_EXECUTESet";
    const model = this.getModel("detailNCC");
    if (!dialog) {
      dialog = new Dialog({
        contentWidth: "600px",
        contentHeight: "200px",
        type: DialogType.Message,
        state: ValueState.Information,
        title: "Ý kiến",
        content: new VBox({
          items: [
            new TextArea({
              id: this.createId("inputPheDuyet"),
              placeholder: "Nhập ý kiến",
              liveChange: this.onChangeValue.bind(this),
              width: "100%",
              height: "150px",
              value: "{detailGMS>/yKienPheDuyet}",
            }),
          ],
        }),
        beginButton: new Button({
          text: "Gửi",
          type: "Emphasized",
          press: () => {
            const value = <string>this.getModel("detailGMS").getProperty("/yKienPheDuyet");

            const input = this.getControlById<Input>("inputPheDuyet");

            if (!value && (btn === "N" || btn === "R")) {
              input.setValueState("Error");
              input.setValueStateText("this fied is required!");
              return;
            }

            const oDataModel5 = this.getComponentModel("oModel5");

            oDataModel5.create(
              path,
              {
                Username: this.UserName,
                WorkItem: this.WorkflowId,
                Text: value,
                Action: btn,
              },
              {
                success: (response: any) => {
                  if (response.Status === "S") {
                    model.setProperty(`/levels/${index}/Aciton`, false);
                    MessageBox.success("Gửi thành công");
                  } else {
                    MessageBox.error(response.Message);
                  }
                  input.destroy();
                },
                error: (error: any) => {
                  MessageBox.error(error.responseText.match(/"value":"(.*?)"/)[1]);
                },
              }
            );
            dialog.close();
          },
        }),
        endButton: new Button({
          text: "Huỷ",
          type: "Default",
          press: () => {
            const input = this.getControlById<TextArea>("inputPheDuyet");
            dialog.close();
            input.destroy();
          },
        }),
      });
    }

    dialog.open();
  }

  public onSubmitStatus(event: Button$PressEvent) {
    const control = event.getSource();
    const btn = <string>control.data("buttonData");

    switch (btn) {
      case "approve01":
        this.popUpPheDuyet("Y", 0, this.dialogGui);
        break;
      case "approve02":
        this.popUpPheDuyet("Y", 1, this.dialogDongThuan);
        break;
      case "approve03":
        this.popUpPheDuyet("A", 2, this.dialogPheDuyet);
        break;

      case "approve04":
        // this.dialogGuiBaoGiaNCC();
        break;
      case "reject02":
        this.popUpPheDuyet("N", 1, this.dialogDongThuan);
        break;
      case "reject03":
        this.popUpPheDuyet("R", 2, this.dialogPheDuyet);
        break;
      case "back03":
        this.popUpPheDuyet("B", 2, this.dialogPheDuyet);
        break;
      default:
        break;
    }
  }

  // #region Download?
  private async download(event: Link$PressEvent) {
    const link = event.getSource();
    const fileName = link.getText();
    const obejectKey = <string>link.getCustomData()[0].getValue();

    const userName = this.UserName;
    const API_ENDPOINT = "NewNCCFileSet";

    if (obejectKey && userName) {
      const path = `${ServiceUrls.serviceUrl5}/${API_ENDPOINT}('${userName}|${obejectKey}')/$value`;

     await this.downloadFile(path, fileName);
    }
  }

  protected statusButton(text: string) {
    const model = this.getModel("detailNCC");

    if (text === "X") {
      return true;
    }
    return false;
  }

   // ??
  private taoTaiKhoan() {
    const path = "/CreateUserSet";
    const model = this.getModel("detailNCC");

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.create(
      path,
      { Username: this.UserName },
      {
        success: (reposonse: ODataResponse<any>) => {
          if (reposonse.Ok === true) {
            model.setProperty("/checkTaoTaiKhoan", reposonse);
            MessageBox.success("Tạo tài khoản thành công!");
          } else {
            MessageBox.error("failed");
          }
        },
        error: (error: any) => {
          MessageBox.error(error.responseText.match(/"value":"(.*?)"/)[1]);
        },
      }
    );
  }

  private StartProset() {
    const button = this.getControlById<Button>("buttonKhoiTaoQuyTrinh");
    const control = this.getControlById<ObjectPageLayout>("ObjectPageLayout");

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.create(
      "/StartProcessSet",
      { Username: this.UserName, Wiid: this.WorkflowId },
      {
        success: (response: any) => {
          if (response.Ok === false) {
            MessageBox.error(response.Message);
          } else {
            MessageBox.success("Khởi tạo quy trình thành công!");
          }
        },
        error: (error: any) => {
          MessageBox.error(error.responseText.match(/"value":"(.*?)"/)[1]);
        },
      }
    );
  }

  public navDetailDonHang(event: ListBase$ItemPressEvent) {
    const item = <any>event.getParameter("listItem")?.getBindingContext("detailNCC")?.getObject();

    this.router.navTo("RouteDonHang", { Magms: item.Magms, Mancc: item.Mancc });
  }

  // #region helper
  public getAppovalHistory(text: string) {
    if (text === "Đồng ý") {
      return "sap-icon://information";
    }
    if (text === "Phê duyệt") {
      return "sap-icon://information";
    }
    if (text === "Không đồng ý") {
      return "sap-icon://error";
    }

    return "sap-icon://error";
  }

  public getSatusAppovalHistory(text: string) {
    if (text === "Đồng ý") {
      return "Information";
    }
    if (text === "Phê duyệt") {
      return "Information";
    }
    if (text === "Không đồng ý") {
      return "Error";
    }

    return "Error";
  }

  public getIcon(text: string) {
    switch (text) {
      case "1":
        return "sap-icon://sys-enter-2";
      case "2":
        return "sap-icon://alert";
      case "3":
        return "sap-icon://information";
      case "4":
        return "sap-icon://error";
    }
    return "";
  }

  public getStatus(status: string) {
    if (status === "1") {
      return "Success";
    }
    if (status === "2") {
      return "Warning";
    }
    if (status === "3") {
      return "Infirmation";
    }

    return "Error";
  }

  public setTextButton(text: string) {
    if (text === "01") {
      return "Gửi";
    } else if (text === "02") {
      return "Đồng ý";
    } else if (text === "03") {
      return "Phê Duyệt";
    } else {
      return "Gửi nhà cung cấp";
    }
  }

  public setTypeButtonPheDuyet(text: string) {
    if (text === "01" || text === "04") {
      return "Emphasized";
    }
    return "Accept";
  }

  public setVisibleButtonPheDuyet(text: string) {
    if (text === "01" || text === "04") {
      return false;
    }
    return true;
  }
}
