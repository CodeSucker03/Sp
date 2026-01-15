import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import type { ComboBox$ChangeEvent } from "sap/m/ComboBox";
import type Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import type { RadioButton$SelectEvent } from "sap/m/RadioButton";
import type Table from "sap/m/Table";
import type View from "sap/ui/core/mvc/View";
import type { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import Base from "./Base.controller";
import type Component from "base/Component";
import type { ODataResponses } from "base/types/odata";
import type { IDonHangArgs } from "base/types/pages/main";

export default class DonHang extends Base {
  private view: View;
  private component: Component;
  private resourceBundle: ResourceBundle;

  private sLastSelectedNTC: string | null = null;
  private oUploadDialog: Dialog;
  private WorkflowId: string;
  private Mancc: string;
  private Magms: string;
  private Status: string;
  private UserName: string;
  private arrDanhGia: string[];

  public override onInit() {
    this.getRouter().getRoute("RouteDonHang")?.attachMatched(this._onRouteMatched, this);
    this.getRouter().getRoute("RouteDonHang")?.attachMatched(this._onRouteWorkflowMatched, this);

    this.view = <View>this.getView();
    this.component = <Component>this.getOwnerComponent();
    this.resourceBundle = this.getResourceBundle();
    this.arrDanhGia = [];

    this.setModel(
      new JSONModel({
        danhSachPR: [],
        loaiDanhGia: [],
        tieuChiDanhGiaNCC: [],
      }),
      "donHang"
    );

    if (!this.oUploadDialog) {
      this.getFormFragment("upload")
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

  private _onRouteMatched = (event: Route$MatchedEvent) => {
    const oArgs = <IDonHangArgs>event.getParameter("arguments");

    const Magms = oArgs?.Magms ?? "";
    const Mancc = oArgs.Mancc ?? "";

    this.Mancc = Mancc;
    this.Magms = Magms;

    // await this.dataLoaded; ?
    this.getLoaiDanhGia();
  };

  private _onRouteWorkflowMatched = (event: Route$MatchedEvent) => {
    const oArgs = <IDonHangArgs>event.getParameter("arguments");

    const url = window.location.href;
    const WorkitemId = url.split("&/WorkitemId=")[1];

    const Magms = oArgs?.Magms ?? "";
    const Mancc = oArgs.Mancc ?? "";

    this.Mancc = Mancc;
    this.Magms = Magms;
    this.WorkflowId = WorkitemId;

    // await this.dataLoaded; ?
    this.getLoaiDanhGia();
  };

  private getBaoGia() {
    const model = this.getModel("donHang");
    const path = "/NCCBGSet";
    const filters: Filter[] = [
      new Filter("Magms", FilterOperator.EQ, this.Magms),
      new Filter("Mancc", FilterOperator.EQ, this.Mancc),
      new Filter("Wiid", FilterOperator.EQ, this.WorkflowId),
    ];

    const oDataModel2 = this.getComponentModel("oModel2");

    oDataModel2.read(path, {
      filters: filters,
      success: (response: ODataResponses) => {
        model.setProperty("/danhSachPR", response.results);
      },
      error: (error: Error) => {
        console.log(error);
      },
    });
  }

  private danhGia(event: RadioButton$SelectEvent) {
    const model = this.getModel("donHang");

    const selectRow = <any>event.getSource().getBindingContext("donHang");
    const object = selectRow?.getObject();
    const value = event.getSource().getText();
    this.arrDanhGia.push(value);

    const data = selectRow.getModel().getProperty("/tieuChiDanhGiaNCC");
    object.Điemg = value;
    const newArr = data.filter((item: any) => {
      return item.Design === "";
    });
    const total = newArr.reduce((acc: any, item: any) => {
      const diem = item.DiemDg === "" ? 0 : parseFloat(item.DiemDg);
      const tyTrong = item.Tytrong === "" ? 0 : parseFloat(item.Tytrong) / 100;
      return acc + diem * tyTrong;
    }, 0);
    data[data.length - 1].ĐiemDg = total.toFixed(1);
    selectRow.getModel().refresh();
  }

  private getLoaiDanhGia() {
    const model = this.getModel("donHang");
    const path = "/LoaiDanhGiaSet";

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      success: (response: ODataResponses) => {
        model.setProperty("/loaiDanhGia", response.results);
      },
      error: (error: Error) => {
        console.log(error);
      },
    });
  }

  private onSelect(event: ComboBox$ChangeEvent) {
    const table: Table = this.getControlById("tableDanhGia");
    const model = this.getModel("donHang");
    const select = event.getParameter("value");
    const path = "/LoaiDanhGiaDetailSet";
    const filter: Filter[] = [
      new Filter("Magms", FilterOperator.EQ, "GMS24.10.01.001"),
      new Filter("Mancc", FilterOperator.EQ, "0010000002"),
      new Filter("CategoryId", FilterOperator.EQ, select),
    ];

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filter,
      success: (response: ODataResponses) => {
        const data = response.results;
        table.setVisible(true);

        data.push({
          Chapnhanduoc: "",
          Design: "",
          DiemDg: "",
          Hailong: "",
          Khonghl: "",
          Magms: "",
          Mancc: "",
          Matieuchi: "",
          Rathailong: "",
          Ratkhonghl: "",
          Tieuchi: "",
          Tytrong: "",
        });

        const newArr = data.filter((item) => {
          return item.Design === "";
        });

        const total = newArr.reduce((acc, item) => {
          const diem = item.DiemDg === "" ? 0 : parseFloat(item.DiemDg);
          const tyTrong = item.Tytrong === "" ? 0 : parseFloat(item.Tytrong);

          return acc + diem * tyTrong;
        }, 0);

        data[data.length - 1].DiemDg = total.toFixed(1);

        data.map((item) => {
          if (item.Tytrong) {
            return (item.Tytrong = item.Tytrong * 100 + "%");
          }
          return item.Tytrong;
        });
        model.setProperty("/tieuChiDanhGiaNCC", data);
      },
      error: (error: Error) => {
        console.log(error);
      },
    });
  }

  private onSaveDanhGia() {
    const path = "/DanhGiaNCCHeaderSet";
    const model = this.getModel("donHang");
    const danhGia = model.getProperty("/tieuChiDanhGiaNCC");
    const newArr = danhGia.filter((item: any) => {
      return item.Desgin === "";
    });
    newArr.map((item: any, index: any) => {
      item.DiemDg = this.arrDanhGia[index];
      item.Tytrong = parseFloat(item.Tytrong) / 100;
      item.Tytrong = `${item.Tytrong}`;
    });

    const data = newArr.map((item: any) => {
      return {
        Manhomdg: item.CategoryId,
        DiemDg: item.DiemDg,
        Magms: item.Magms,
        Mancc: item.Mancc,
        Matieuchi: item.Matieuchi,
        Tytrong: item.Tytrong,
      };
    });

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.create(
      path,
      {
        Magms: this.Magms,
        Mancc: this.Mancc,
        DanhGiaNCC: data,
      },
      {
        success: () => {
          MessageBox.success("Gửi đánh giá thành coong");
        },
        error: () => {
          MessageBox.error("Gửi đánh giá thất bại");
        },
      }
    );
  }
}
