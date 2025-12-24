
export enum ExtractionTemplate {
  GENERAL = 'General Description',
  INVOICE = 'Invoice/Receipt',
  RECIPE = 'Cooking Recipe',
  BUSINESS_CARD = 'Business Card',
  PRODUCT = 'E-commerce Product',
  OCR = 'Full OCR Text',
  CUSTOM = 'Custom Script'
}

export interface AnalysisResult {
  json: string;
  template: ExtractionTemplate;
  timestamp: string;
}

export interface ImageState {
  data: string;
  mimeType: string;
  previewUrl: string;
}
