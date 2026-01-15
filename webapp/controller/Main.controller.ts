import Base from "./Base.controller";
import type Component from "base/Component";
import type { ODataResponse, ODataResponses } from "base/types/odata";
import type { NCCDaDuyet, NCCList } from "base/types/pages/main";
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import type { InputBase$ChangeEvent } from "sap/m/InputBase";
import type Label from "sap/m/Label";
import { DialogType } from "sap/m/library";
import type { Link$PressEvent } from "sap/m/Link";
import type { ListBase$ItemPressEvent } from "sap/m/ListBase";
import MessageBox from "sap/m/MessageBox";
import type MultiComboBox from "sap/m/MultiComboBox";
import Engine from "sap/m/p13n/Engine";
import type MetadataHelper from "sap/m/p13n/MetadataHelper";
import type SearchField from "sap/m/SearchField";
import type Table from "sap/m/Table";
import Text from "sap/m/Text";
import TextArea from "sap/m/TextArea";
import VBox from "sap/m/VBox";
import type FilterBar from "sap/sac/df/FilterBar";
import type SelectOption from "sap/ui/comp/smartfilterbar/SelectOption";
import type SmartVariantManagement from "sap/ui/comp/smartvariants/SmartVariantManagement";
import { ValueState } from "sap/ui/core/library";
import type Router from "sap/ui/core/routing/Router";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ListBinding from "sap/ui/model/ListBinding";
import type TreeTable from "sap/ui/table/TreeTable";
import type View from "sap/ui/vk/View";

/**
 * @namespace com.sphinxjsc.spbase.controller
 */

export default class Main extends Base {
  private view: View;
  private component: Component;
  private table: TreeTable;
  private MetadataHelper: MetadataHelper;
  private expandedLabel: Label;
  private snappedLabel: Label;
  private svm: SmartVariantManagement;
  private filterBar: FilterBar;
  private engine: Engine;
  private resourceBundle: ResourceBundle;

  private router: Router;
  private DialogPurchase: Dialog;

  private selectedTabIndex = 0;
  private dialogKichHoat: Dialog;
  private dialogVoHieuHoa: Dialog;
  private userName: string;

  public override onInit() {
    // await this.dataLoaded;

    this.component = <Component>this.getOwnerComponent();
    this.resourceBundle = this.getResourceBundle();
    this.router = this.getRouter();

    this.table = this.getControlById("prTable");

    this.setModel(new JSONModel({ rows: [] }), "listGMS");

    const filterBar = this.getControlById<FilterBar>("filterBar");

    this.setModel(
      new JSONModel({
        DSNCCChoDangKy: [],
        DSDaDuyetDangKy: [],
        DSNCCHienHuu: [],
        status: [
          { key: "1", text: "Đăng ký mới" },
          { key: "2", text: "Đang xử lý" },
          { key: "3", text: "Từ chối" },
        ],
        status1: [
          { key: "1", text: "Hoạt động" },
          { key: "2", text: "Không hoạt động" },
        ],
        valueKichHoat: "",
        id: "",
      }),
      "listNCC"
    );

    this.setModel(new JSONModel({ status: "" }), "searchHelp");

    this.engine = Engine.getInstance();
    this.getNCCChoDangKy();
    this.getNCCDaDangKy();
    this.getNCCHienHuu();
  }

  public override onExit(): void | undefined {}

  public onRefresh() {}

  public onCollapseAll() {
    this.table.collapseAll();
  }

  public onExpandAll() {
    this.table.expandToLevel(1998);
  }

  // #region Unknown
  // public statusTextFormatter(value: string | null) {
  //   const searchHelpModel = this.getModel("searchHelp");

  //   if (!value) return "";

  //   const items = <SelectOption[]>searchHelpModel.getProperty("/Status");

  //   return items.find((item) => item.key === value)?.text ?? "";
  // }

  // ????
  // public statusStateFormatter(value: string | null) {
  //   const searchHelpModel = this.getModel("searchModel");

  //   if (!value) return "";

  //   const items = <SelectOption[]>searchHelpModel.getProperty("/Status");

  //   const item = items.find((item) => item.key === value);

  //   switch (item?.key) {
  //     case "01":
  //       return ValueState.Information;
  //     case "02":
  //       return ValueState.Success;
  //     case "03":
  //       return ValueState.Information;
  //     case "04":
  //       return ValueState.Error;
  //     default:
  //       return ValueState.None;
  //   }
  // }

  // ????
  // public statusIconFormatter(value: string | null) {
  //   const searchHelpModel = this.getModel("searchModel");

  //   if (!value) return "";

  //   const items = <SelectOption[]>searchHelpModel.getProperty("/Status");

  //   const item = items.find((item) => item.key === value);

  //   switch (item?.key) {
  //     case "01":
  //       return "sap-icon://information";
  //     case "02":
  //       return "sap-icon://sys-enter-2";
  //     case "03":
  //       return "sap-icon://information";
  //     case "04":
  //       return "sap-icon://error";
  //     default:
  //       return "";
  //   }
  // }

  public navGMSDetail(event: Link$PressEvent) {
    const Link = event.getSource();
    const sText = Link.getText();

    const status = <string>Link.getBindingContext("listNCC")?.getProperty("status");

    this.router.navTo("RouteGMS", {
      Status: status,
      UserName: sText === "" ? "noUserName" : sText,
    });
  }

  public navGMS(event: ListBase$ItemPressEvent) {
    const item = <NCCList>event.getParameter("listItem")?.getBindingContext("listNCC")?.getObject();

    this.router.navTo("RouterGMS", {
      Status: item.Status,
      UserName: item.Username === "" ? "noUserName" : item.Username,
    });
  }

  public getStatus(status: string) {
    if (status === "1") {
      return "Information";
    }
    if (status === "2") {
      return "Warning";
    }
    if (status === "3") {
      return "Success";
    }
    return "Error";
  }

  private getNCCChoDangKy() {
    const path = "/NCCListSet";
    const model = this.getModel("listNCC");

    const filter: Filter[] = [new Filter("Status", FilterOperator.EQ, "chuaDuyet")]; // backend filter

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filter,
      success: (response: ODataResponses<NCCList[]>) => {
        const filteredData = response.results.filter((item) => item.Status === "chuaDuyet");

        model.setProperty("/DSNCCChoDangKy", filteredData);
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }

  private getNCCDaDangKy() {
    const path = "/NCCListSet";
    const model = this.getModel("listNCC");

    const filter: Filter[] = [new Filter("Status", FilterOperator.EQ, "daDuyet")]; // BE filter

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filter,
      success: (reponse: ODataResponses) => {
        model.setProperty("/DSDaDuyetDangKy", reponse.results);
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }

  private getNCCHienHuu() {
    const path = "/NCCListSet";
    const model = this.getModel("listNCC");

    const filter: Filter[] = [new Filter("Status", FilterOperator.EQ, "hienHuu")]; // BE filter

    const oDataModel5 = this.getComponentModel("oModel5");

    oDataModel5.read(path, {
      filters: filter,
      success: (reponse: ODataResponses) => {
        model.setProperty("/DSNCCHienHuu", reponse.results);
      },
      error: (err: Error) => {
        console.log(err);
      },
    });
  }

  private formatStatus(text: string) {
    switch (text) {
      case "1":
        return "Đăng ký mới";

      case "2":
        return "Đang xử lý";

      case "3":
        return "Từ chối";

      default:
        return "";
    }
  }

  private formatStatus1(text: string) {
    switch (text) {
      case "1":
        return "Hoạt động";

      case "2":
        return "Không hoạt động";

      default:
        return "";
    }
  }

  private formatState(text: string) {
    switch (text) {
      case "1":
        return "Information";
      case "2":
        return "Warning";
      case "3":
        return "Error";
      case "4":
        return "Success";
      case "5":
        return "Error";

      default:
        return "";
    }
  }

  private searchNCCChoDuyet() {
    const list = this.getControlById("listNCC");
    const search = this.getControlById<SearchField>("searchNCCChoduyet");
    const combobox = this.getControlById<MultiComboBox>("comboBoxNCCChoDuyet");
    const binding = <ListBinding>list?.getBinding("items");
    const valueSearch = search.getValue();
    const comboboxKeys = combobox.getSelectedKeys();
    const comboboxValue = comboboxKeys.map((item) => {
      return new Filter("Status", FilterOperator.EQ, item);
    });

    const searchValue: Filter[] = [
      new Filter("Username", FilterOperator.Contains, valueSearch),
      new Filter("Companyname", FilterOperator.Contains, valueSearch),
    ];

    if (!valueSearch === true && comboboxKeys.length === 0) {
      const filter: Filter[] = [new Filter("Pheduyet", FilterOperator.EQ, "X")];

      binding?.filter(filter);
    } else if (!valueSearch) {
      const filters: Filter[] = [new Filter({ filters: comboboxValue, and: false })];

      binding?.filter(filters);
    } else if (comboboxKeys.length === 0) {
      const filters: Filter[] = [new Filter({ filters: searchValue, and: false })];

      binding?.filter(filters);
    } else {
      const searchFilter: Filter[] = [
        new Filter({ filters: searchValue, and: false }),
        new Filter({ filters: comboboxValue, and: false }),
      ];

      const filters: Filter[] = [new Filter({ filters: searchFilter, and: true })];
      binding?.filter(filters);
    }
  }

  private searchNCCDaDuyet() {
    const list = this.getControlById("tableNCCDaDuyet");
    const search = this.getControlById<SearchField>("searchNCCDaDuyet");
    const combobox = this.getControlById<MultiComboBox>("comboBoxNCCDaDuyet");

    const binding = <ListBinding>list?.getBinding("items");
    const valueSearch = search.getValue();
    const comboboxKeys = combobox.getSelectedKeys();

    const comboboxValue = comboboxKeys.map((item) => {
      return new Filter("Status", FilterOperator.EQ, item);
    });

    const searchValue: Filter[] = [
      new Filter("Username", FilterOperator.Contains, valueSearch),
      new Filter("Companyname", FilterOperator.Contains, valueSearch),
    ];

    if (!valueSearch === true && comboboxKeys.length === 0) {
      const filter: Filter[] = [new Filter("Daduyet", FilterOperator.EQ, "X")];

      binding?.filter(filter);
    } else if (!valueSearch) {
      const filters: Filter[] = [new Filter({ filters: comboboxValue, and: false })];

      binding?.filter(filters);
    } else if (comboboxKeys.length === 0) {
      const filters: Filter[] = [new Filter({ filters: searchValue, and: false })];

      binding?.filter(filters);
    } else {
      const searchFilter: Filter[] = [
        new Filter({ filters: searchValue, and: false }),
        new Filter({ filters: comboboxValue, and: false }),
      ];

      const filters: Filter[] = [new Filter({ filters: searchFilter, and: true })];
      binding?.filter(filters);
    }
  }

  private searchNCCHienHuu() {
    const list = this.getControlById("tableNCCHienHuu");
    const search = this.getControlById<SearchField>("searchNCCCHienHuu");
    const combobox = this.getControlById<MultiComboBox>("comboBoxNCCHienHuu");

    const binding = <ListBinding>list?.getBinding("items");
    const valueSearch = search.getValue();
    const comboboxKeys = combobox.getSelectedKeys();

    const comboboxValue = comboboxKeys.map((item) => {
      return new Filter("Status", FilterOperator.EQ, item);
    });

    const searchValue: Filter[] = [
      new Filter("Username", FilterOperator.Contains, valueSearch),
      new Filter("Companyname", FilterOperator.Contains, valueSearch),
    ];

    if (!valueSearch === true && comboboxKeys.length === 0) {
      const filter: Filter[] = [new Filter("Exist", FilterOperator.EQ, "X")];

      binding?.filter(filter);
    } else if (!valueSearch) {
      const filters: Filter[] = [new Filter({ filters: comboboxValue, and: false })];

      binding?.filter(filters);
    } else if (comboboxKeys.length === 0) {
      const filters: Filter[] = [new Filter({ filters: searchValue, and: false })];

      binding?.filter(filters);
    } else {
      const searchFilter: Filter[] = [
        new Filter({ filters: searchValue, and: false }),
        new Filter({ filters: comboboxValue, and: false }),
      ];

      const filters: Filter[] = [new Filter({ filters: searchFilter, and: true })];
      binding?.filter(filters);
    }
  }

  public onSelectRow() {
    const table = this.getControlById<Table>("tableNCCDaDuyet");

    const row = table.getSelectedContexts().map((item) => {
      return item.getObject();
    });

    const kichHoat = row.filter((item: any) => {
      return item.Status === "4";
    });
  }

  // #region Activate

  private onConfirmKichHoat(): void {
    const Model = this.getModel("listNCC");
    const OriginTableId = Model.getProperty("/id") as string;
    const Comment = Model.getProperty("/valueKichHoat") as string;

    // Get controls
    const Table = this.getControlById<Table>(OriginTableId);
    const TextArea = this.byId("yKienKichHoat") as TextArea;

    // Validation Logic
    if (!Comment || Comment.trim() === "") {
      TextArea.setValueState("Error");
      TextArea.setValueStateText("Vui lòng nhập ý kiến nhận xét (This field is required)");
      return;
    }

    // Prepare OData Call
    Table.setBusy(true);
    const oDataModel = this.getComponentModel("oModel5");

    const Payload = {
      Username: this.userName,
      Status: "1",
      Text: Comment,
    };

    oDataModel.create("/BlockNCCSet", Payload, {
      success: () => {
        Table.setBusy(false);
        MessageBox.success("Kích hoạt thành công");

        // Refresh logic based on which table triggered the dialog
        if (OriginTableId === "tableNCCDaDuyet") {
          this.getNCCDaDangKy();
        } else {
          this.getNCCHienHuu();
        }

        Table.removeSelections(true);
        this.closeDialogKichHoat(); // Close only after successful API call
      },
      error: (Error: any) => {
        Table.setBusy(false);

        // Safer error parsing
        let ErrorMessage = "Đã có lỗi xảy ra";
        try {
          const oResponse = JSON.parse(Error.responseText);
          ErrorMessage = oResponse.error.message.value;
        } catch (e) {
          const match = Error.responseText.match(/"value":"(.*?)"/);
          if (match) ErrorMessage = match[1];
        }

        MessageBox.error(ErrorMessage);
      },
    });
  }

  private kichHoat(id: string) {
    const model = this.getModel("listNCC");
    model.setProperty("/id", id);

    const tableDaDuyet = this.getControlById<Table>(`${id}`);

    const selectIndexTable = <NCCDaDuyet>tableDaDuyet.getSelectedItem().getBindingContext("listNCC")?.getObject();

    this.userName = selectIndexTable.Username;
    const tenNCC = selectIndexTable.Tenncc;

    if (!this.dialogKichHoat) {
      this.dialogKichHoat = new Dialog({
        contentHeight: "800px",
        contentWidth: "154px",
        type: DialogType.Message,
        state: ValueState.Warning,
        title: "Xác nhận kích hoạt",
        content: new VBox({
          items: [
            new Text({
              id: this.createId("titleKichHoat"),
              text: `Xác nhận kích hoạt nhà cung cấp ${tenNCC}`,
            }),
            new TextArea({
              id: this.createId("yKienKichHoat"),
              placeholder: "Nhập ý kiến nhận xét",
              liveChange: this.onchange.bind(this),
              width: "100%",
              height: "100px",
              value: "{listNCC>/valueKichHoat}",
              required: true,
            }),
          ],
        }),
        beginButton: new Button({
          text: "Xác nhận",
          type: "Emphasized",
          press: () => {
            this.onConfirmKichHoat();
          },
        }),
        endButton: new Button({
          text: "Huỷ",
          press: () => {
            this.closeDialogKichHoat();
          },
        }),
      });
    }

    const control = this.getControlById<Text>("titleKichHoat");
    control.setText(`Xác nhận kích hoạt nhà cung cấp ${tenNCC}`);

    this.getView()?.addDependent(this.dialogKichHoat);
    this.dialogKichHoat.open();
  }

  private closeDialogKichHoat() {
    this.getModel("listNCC").setProperty("/valueKichHoat", "");
    this.dialogKichHoat.close();
  }

  //#region Deactivate

  private onConfirmVoHieuHoa(): void {
    const Model = this.getModel("listNCC");
    const OriginTableId = Model.getProperty("/id") as string;
    const Comment = Model.getProperty("/valueVoHieuHoa") as string; // Ensure model path matches deactivation logic

    // Get controls dynamically
    const Table = this.getControlById<Table>(OriginTableId);
    const TextArea = this.byId("yKienVoHieuHoa") as TextArea;

    if (!Comment || Comment.trim() === "") {
      TextArea.setValueState(ValueState.Error);
      TextArea.setValueStateText("Vui lòng nhập lý kiến (This field is required)");
      return;
    }

    // Prepare OData Call
    Table.setBusy(true);
    const oDataModel = this.getComponentModel("oModel5");
    const oPayload = {
      Username: this.userName,
      Status: "2", // Status 2 for Deactivation
      Text: Comment,
    };

    oDataModel.create("/BlockNCCSet", oPayload, {
      success: () => {
        Table.setBusy(false);
        MessageBox.success("Vô hiệu hóa thành công");

        // Conditional Refresh Logic
        if (OriginTableId === "tableNCCDaDuyet") {
          this.getNCCDaDangKy();
        } else {
          this.getNCCHienHuu();
        }

        Table.removeSelections(true);
        this.closeDialogVoHieuHoa();
      },
      error: (oError: any) => {
        Table.setBusy(false);

        // Extract specific error message from OData if possible
        let sMsg = "Vô hiệu hoá thất bại";
        try {
          sMsg = JSON.parse(oError.responseText).error.message.value;
        } catch (e) {
          /* fall back to default */
        }

        MessageBox.error(sMsg);
      },
    });
  }

  private voHieuHoa(id: string) {
    const model = this.getModel("listNCC");
    model.setProperty("/id", id);

    const tableDaDuyet = this.getControlById<Table>(`${id}`);
    const selectIndexTable = <NCCDaDuyet>tableDaDuyet.getSelectedItem().getBindingContext("listNCC")?.getObject();

    this.userName = selectIndexTable.Username;
    const tenNCC = selectIndexTable.Tenncc;

    if (!this.dialogVoHieuHoa) {
      this.dialogVoHieuHoa = new Dialog({
        contentHeight: "800px",
        contentWidth: "154px",
        type: DialogType.Message,
        state: ValueState.Warning,
        title: "Xác nhận vô hiệu hoá",
        content: new VBox({
          items: [
            new Text({
              id: this.createId("titleVoHieuHoa"),
              text: `Xác nhận kích hoạt nhà cung cấp ${tenNCC}`,
            }),
            new TextArea({
              id: this.createId("yKienVoHieuHoa"),
              placeholder: "Nhập ý kiến nhận xét",
              liveChange: this.onchangeVoHieuHoa.bind(this),
              width: "100%",
              height: "100px",
              value: "{listNCC>/valueKichHoat}",
              required: true,
            }),
          ],
        }),
        beginButton: new Button({
          text: "Xác nhận",
          type: "Emphasized",
          press: () => {
            this.onConfirmVoHieuHoa();
          },
        }),
        endButton: new Button({
          text: "Huỷ",
          press: () => {
            this.closeDialogVoHieuHoa();
          },
        }),
      });
    }

    const control = this.getControlById<Text>("titleVoHieuHoa");
    control.setText(`Xác nhận vô hiệu hoá nhà cung cấp ${tenNCC}`);

    this.getView()?.addDependent(this.dialogVoHieuHoa);
    this.dialogVoHieuHoa.open();
  }

  private closeDialogVoHieuHoa() {
    this.getModel("listNCC").setProperty("/valueKichHoat", "");
    this.dialogVoHieuHoa.close();
  }

  public kichHoatNCCDaDuyet() {
    this.kichHoat("tableNCCDaDuyet");
  }

  public voHieuHoaNCCDaDuyet() {
    this.voHieuHoa("tableNCCDaDuyet");
  }

  public kichHoatNCCHienHuu() {
    this.kichHoat("tableNCCHienHuu");
  }

  public voHieuHoaNCCHienHuu() {
    this.voHieuHoa("tableNCCHienHuu");
  }

  public onchangeVoHieuHoa(event: InputBase$ChangeEvent) {
    const input = <TextArea>this.byId("yKienVoHieuHoa");
    const value = this.getModel("listNCC");
    const valueInput = event.getSource().getValue();

    value.setProperty("/valueKichHoat", valueInput);

    if (!valueInput) {
      input.setValueState(ValueState.Error);
      input.setValueStateText("this field is required");
    } else {
      input.setValueState("None");
    }
  }

  public onchange(event: InputBase$ChangeEvent) {
    const input = <TextArea>this.byId("yKienKichHoat");
    const nccModel = this.getModel("listNCC");
    const valueInput = event.getSource().getValue();

    nccModel.setProperty("/valueKichHoat", valueInput);

    if (!valueInput) {
      input.setValueState(ValueState.Error);
      input.setValueStateText("this field is required");
    } else {
      input.setValueState("None");
    }
  }
}
