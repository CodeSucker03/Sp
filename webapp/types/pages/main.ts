// Interfaces
export interface NCCList {
  Username: string;   // MaxLength: 12
  Mancc: string;      // MaxLength: 12
  Tenncc: string;     // MaxLength: 255
  Diemnl: string;     // MaxLength: 3
  Danhgia: string;    // MaxLength: 3
  Solanmua: string;   // MaxLength: 5
  Diachincc: string;  // MaxLength: 255
  Status: string;     // MaxLength: 1
}

export interface NCCExistsInfo {
  // Key
  Username: string; // MaxLength: 12

  Mancc: string; // MaxLength: 12
  CompanyName: string; // MaxLength: 255
  Taxnumber: string; // MaxLength: 20
  CompanyAddress: string; // MaxLength: 255
  Thanhlap: string; // MaxLength: 10
  Website: string; // MaxLength: 40

  // Legal representative
  NddTitle: string; // MaxLength: 1
  NddHoten: string; // MaxLength: 60
  NddChucvu: string; // MaxLength: 60
  NddIdnumber: string; // MaxLength: 15
  NddNationality: string; // MaxLength: 60

  // Contact person
  DmTitle: string; // MaxLength: 1
  DmHoten: string; // MaxLength: 60
  DmChucvu: string; // MaxLength: 60
  DmSdt: string; // MaxLength: 15
  DmEmail: string; // MaxLength: 30

  // Business info
  Gioithieu: string; // MaxLength: 60
  Quymo: string; // MaxLength: 11

  // Business scope flags
  Phamvi1: string; // MaxLength: 1
  Phamvi2: string; // MaxLength: 1
  Phamvi3: string; // MaxLength: 1
  Phamvi4: string; // MaxLength: 1

  // Financials
  CharterCapital: string; // MaxLength: 23

  DtYear1: string; // MaxLength: 4
  DtYear2: string; // MaxLength: 4
  DtYear3: string; // MaxLength: 4
  DtAmount1: string; // MaxLength: 23
  DtAmount2: string; // MaxLength: 23
  DtAmount3: string; // MaxLength: 23

  LnYear1: string; // MaxLength: 4
  LnYear2: string; // MaxLength: 4
  LnYear3: string; // MaxLength: 4
  LnAmount1: string; // MaxLength: 23
  LnAmount2: string; // MaxLength: 23
  LnAmount3: string; // MaxLength: 23

  Waers: string; // MaxLength: 5 (currency code)

  // Workflow flags
  Agree: string; // MaxLength: 1
  Status: string; // MaxLength: 1
  YcUpdate: string; // MaxLength: 1
  DongthuanYc: string; // MaxLength: 1
}

export interface NewNCCFileList {
  // Composite key
  Username: string;   // MaxLength: 12
  Filetype: string;   // MaxLength: 1
  ObjectKey: string;  // Edm.Guid → string in TS

  // File info
  Filename: string;
  Mimetype: string;

  // Audit
  CreateDate: string; // MaxLength: 10 (yyyy-mm-dd, probably)
  CreateTime: string; // MaxLength: 8 (hh:mm:ss)
  CreateBy: string;   // MaxLength: 12
}


export interface PRItem {
  Magms: string;
  Banfn: string;
  Bnfpo: string;
  Erdat: string;
  StartDate: string;
  Loekz: string;
  Txz01: string;
  Wgbez: string;
  Status: string;
  BanfnText: string;
}

export interface GMSHdrType {
  saveable?: boolean;
  submitable?: boolean;
  Magms?: string | null;
  Tengms?: string | null;
  PrQuantity?: string | null;
  StartDate?: string | null;
  Status?: string | null;
  Substatus?: string | null;
  Note?: string | null;
  Htms: string | null;
  Hscg: string | null;
  Ptms: string | null;
}

export interface ApprovalLineType {
  Magms: string | null;
  Manhomcv: string | null;
  ParticiUnit: string | null;
  ParticiUnitText: string | null;
  buildRequire?: string | null;
  OpenFolder?: string | null;
  Supervisor?: string | null;
  Score?: string | null;
  Tdkq?: string | null;
  Tdncc?: string | null;
  CreateHd?: string | null;
  PreApprovers: { key: string; text: string }[];
  Approve1: string | null;
  Approve2: string | null;
  Announce?: string | null;
  bFieldsFilled?: { [key: string]: boolean };
  check?: boolean;
}

export interface ScoreDetailType {
  Magms: string;
  Manhomtc: string;
  Matieuchi: string;
  TieuchiH?: string;
  Tieuchi?: string;
  Ycchitiet1?: string;
  Ycchitiet2?: string;
  Yctoithieu?: string;
  Cancuchamdiem?: string;
  Cosochamdiem?: string;
  Tytrong: string;
  Nguoicham?: string;
  Ghichu?: string;
  FolderType?: string;
  categories?: ScoreDetailType[];
}

export interface ScoreCriteriaGroup {
  Magms: string;
  Manhomtc?: string;
  Nhomtc: string;
  TyTrong?: string;
  TytrongTxt?: string;
  FolderType: string;
  SCORECARD?: ScoreDetailType[];
}

export interface GMSBodyType {
  HEADER: GMSHdrType;
  TIMELINE: {
    TL_StartDate1: string;
    TL_EndDate1: string;
    TL_StartDate2: string;
    TL_EndDate2: string;
    TL_StartDate3: string;
    TL_EndDate3: string;
    TL_StartDate4: string;
    TL_EndDate4: string;
  };
  ATTACHMENTS: { mimetype: string; filename: string; objectkey: string }[];
  APRVMATRIX?: {
    Magms: string | null;
    TOINIT_MT: ApprovalLineType[];
    TOCDDP_MT: ApprovalLineType[];
    TOCNCC_MT: ApprovalLineType[];
    TOHD_MT: ApprovalLineType[];
  };
  DAUBAI_LIST?: { mimetype: string; filename: string; objectkey: string }[];
  SCORECARD?: { categories: ScoreDetailType[] };
}

export interface DataNCC {
  Mancc: string;
  Tencc: string;
  Diemnl: string;
  Danhgia: string;
  Solanmua: string;
  Diachincc: string;
}

export interface GMS {
  CreateDate: string;
  EndDate: string;
  Hscg: string;
  Htms: string;
  Magms: string;
  Ptms: string;
  StartDate: string;
  Status: string;
  Substatus: string;
  Tengms: string;
}

export interface NCCDaDuyet {
  Daduyet: string;
  Diachincc: string;
  Mancc: string;
  Ngaydangky: string;
  Ngaypheduyet: string;
  Pheduyet: string;
  Status: string;
  Tenncc: string;
  Username: string;
}

export interface NCCHienHuu {
  Danhgia: string;
  Diachincc: string;
  Mancc: string;
  Diemnl: string;
  Solanmua: string;
  Tenncc: string;
}


// Interface for RouteDonHang: "DonHang/{Magms}/{Mancc}"
export interface IDonHangArgs {
    Magms: string;
    Mancc: string;
}

// Interface for RouterGMS: "ncc/{Status}/{UserName}"
export interface IGMSArgs {
    Status: string;
    UserName: string;
}