import { useState } from "react";
import { ConsentGate } from "./components/ConsentGate";
import { StepEkycIntro } from "./components/StepEkycIntro";
import { Step1PersonalInfo } from "./components/Step1PersonalInfo";
import { Step2BankRegistration } from "./components/Step2BankRegistration";
import type { PersonalInfoForm, BankInfoForm } from "./types";

type AppStep = "consent" | "ekyc" | "step1" | "step2";

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
  const [step, setStep]                 = useState<AppStep>("consent");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoForm>(emptyPersonalInfo);
  const [bankInfo, setBankInfo]         = useState<BankInfoForm>(emptyBankInfo);

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
          // Pre-fill holder from kana on first visit; preserve what was entered on return visits
          setBankInfo(prev => ({ ...prev, holder: prev.holder || data.kana }));
          setStep("step2");
        }}
        onBack={() => setStep("ekyc")}
      />
    );
  }

  return (
    <Step2BankRegistration
      initialData={bankInfo}
      onProceed={(data) => {
        setBankInfo(data);
        alert(
          "✅ ステップ2完了。\n" +
          "銀行：" + data.bank!.name + " (" + data.bank!.code + ")\n" +
          "支店：" + data.branch!.name + " (" + data.branch!.code + ")\n" +
          "口座番号：" + data.accountNumber
        );
      }}
      onBack={() => setStep("step1")}
    />
  );
}
