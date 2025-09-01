export interface Trademark {
    id: string;
    trademarkName: string;
    tmName?: string;
    name?: string;
    description?: string;
    trademarkTextureUrl?: string;
    trademarkPdfUrl?: string;
  }
  export interface Color {
    id: string;
    name: string;
    trademarks?: Trademark[];
  }
  
  export interface ExtendedTrademark extends Trademark {
    logoUrl: string;
    advantages: { image: string; text: string }[];
    colorTm: string;
    colors: { image: string; name: string; pdf?: string }[];
    desktopAdvantageUrl: string;
    mobileAdvantageUrl: string;
    nameUrl: string;
  }
  
  export interface WidgetData {
    widgetName: string;
    adminEmail: string;
    languageId: string;
    color: Color[];
    trademark: ExtendedTrademark[];
    house: Array<{ id: string; name: string }>;
  }
  
  export interface ImageData {
    id: string;
    colorId: string;
    colorName: string[];
    houseId: string;
    houseName: string;
    imageUrls: string[];
    trademarkId: string;
    trademarkName: string;
  }
  
  export interface FormTranslations {
    color: string;
    data_protection: string;
    email: string;
    enter_email: string;
    enter_name: string;
    enter_phone: string;
    get_consultation: string;
    house_type: string;
    leave_request: string;
    name: string;
    ok: string;
    phone_number: string;
    selected_fasad: string;
    thank_you: string;
    tm: string;
    your_name: string;
    letter_header: string;
    letter_subject: string;
    letter_thanku: string;
    letter_feedback: string;
    letter_pdf: string;
  }
  
  export interface WidgetTranslations {
    about_tm: string;
    choose_fasad: string;
    choose_house: string;
    choose_tm: string;
    color_texture_hover: string;
    color_texture_select: string;
    colors: string;
    download_pdf: string;
    fasad_description: string;
    order_fasad: string;
    reset_filters: string;
    selected: string;
    start_description: string;
    tm: string;
    view_3d: string;
    zoom_image: string;
    zoom_image_detail: string;
    mobile_filters:string;
    mobile_pdf:string;
  }
  
  export interface Translations {
    form: FormTranslations;
    widget: WidgetTranslations;
  }

 export interface House {
    name: string;
    iconUrl?: string;
  }
  