import JSONModel from "sap/ui/model/json/JSONModel";
import Device from "sap/ui/Device";

export function createDeviceModel () {
    const model = new JSONModel(Device);
    model.setDefaultBindingMode("OneWay");
    return model;
}

export const numRegex =
  // eslint-disable-next-line no-useless-escape
  /^(I{1,3}|IV|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|XXII|XXIII|XXIV|[a-zA-Z])[\.\)]?\s?/;

// Regex để tìm số La Mã đầu chuỗi
export const latinNumberRegex =
  /^(I{1,3}|IV|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX|XXI|XXII|XXIII|XXIV)\.?\s*/;

// Hàm loại bỏ số La Mã đầu chuỗi (ví dụ "I. Dự án" => "Dự án")
export const trimLeadingLatinNumber = (str: string): string => {
  return str.replace(latinNumberRegex, "");
};

// Danh sách các đơn vị phòng ban
export const DEPARTMENTS: Array<{ [key: string]: string }> = [
  { MSTT: "Mua sắm tập trung" },
  { DVDX: "Đơn vị đề xuất" },
  { DVCM: "Đơn vị chuyển môn" },
  { KTC: "Khối tài chính" },
  { DUAN: "Dự án" },
];

export const ServiceUrls = {
  serviceUrl1: "/sap/opu/odata/sap/ZODATA_MSTT_SP1_SRV",
  serviceUrl2: "/sap/opu/odata/sap/ZODATA_MSTT_SP2_SRV",
  serviceUrl3: "/sap/opu/odata/sap/ZODATA_MSTT_SP3_SRV",
  serviceUrl4: "/sap/opu/odata/sap/ZODATA_MSTT_SP4_SRV",
  serviceUrl5: "/sap/opu/odata/sap/ZODATA_MSTT_SP5_SRV",
};