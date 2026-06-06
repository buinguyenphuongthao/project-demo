import { useState } from "react";
import { ConsentGate } from "./components/ConsentGate";
import { StepEkycIntro } from "./components/StepEkycIntro";
import { Step1PersonalInfo } from "./components/Step1PersonalInfo";
import { Step2BankRegistration } from "./components/Step2BankRegistration";
import { Step3IdentityVerification } from "./components/Step3IdentityVerification";
import type { PersonalInfoForm, BankInfoForm, IdentityVerificationMethod } from "./types";

type AppStep = "consent" | "ekyc" | "step1" | "step2" | "step3";

const emptyPersonalInfo: PersonalInfoForm = {
  name: "", kana: "", dobYear: "", dobMonth: "", dobDay: "",
  postalCode: "", prefecture: "", address: "", occupation: "",
  email: "", invoiceNotIssuer: false, invoiceNumber: "",
};

const emptyBankInfo: BankInfoForm = {
  holder: "",
  bank: null,
  branch: null,
  accountNumber: "",
  appraisalNotify: "required",
};

export default function App() {
  const [step, setStep]                     = useState<AppStep>("consent");
  const [personalInfo, setPersonalInfo]     = useState<PersonalInfoForm>(emptyPersonalInfo);
  const [bankInfo, setBankInfo]             = useState<BankInfoForm>(emptyBankInfo);
  const [identityMethod, setIdentityMethod] = useState<IdentityVerificationMethod | null>(null);

  if (step === "consent") {
    return <ConsentGate onProceed={() => setStep("ekyc")} />;
  }

  if (step === "ekyc") {
    return (
      <StepEkycIntro
        onProceed={() => setStep("step1")}
        onBack={() => setStep("consent")}
      />
    );
  }

  if (step === "step1") {
    return (
      <Step1PersonalInfo
        initialData={personalInfo}
        onProceed={(data) => {
          setPersonalInfo(data);
          setBankInfo(prev => ({ ...prev, holder: prev.holder || data.kana }));
          setStep("step2");
        }}
        onBack={() => setStep("ekyc")}
      />
    );
  }

  if (step === "step2") {
    return (
      <Step2BankRegistration
        initialData={bankInfo}
        onProceed={(data) => {
          setBankInfo(data);
          setStep("step3");
        }}
        onBack={() => setStep("step1")}
      />
    );
  }

  return (
    <Step3IdentityVerification
      initialMethod={identityMethod}
      onProceed={(method) => {
        setIdentityMethod(method);
        alert("✅ ステップ3完了。\n確認方法：" + method);
      }}
      onBack={() => setStep("step2")}
    />
  );
}
