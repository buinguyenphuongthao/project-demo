export interface TermsSection {
  article: string; // e.g. "第1条 — 目的"
  body: string;
}

export interface PersonalInfoForm {
  name: string;
  kana: string;
  dobYear: string;
  dobMonth: string;
  dobDay: string;
  postalCode: string;
  prefecture: string;
  address: string;
  occupation: string;
  email: string;
  invoiceNotIssuer: boolean;
  invoiceNumber: string;
}

export interface BankEntry {
  code: string;
  name: string;
  kana: string;
}

export interface BranchEntry {
  code: string;
  name: string;
  kana: string;
}

export interface BankInfoForm {
  holder: string;
  bank: BankEntry | null;
  branch: BranchEntry | null;
  accountNumber: string;
  appraisalNotify: 'required' | 'not-needed';
}
