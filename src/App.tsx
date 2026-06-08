import { useState } from "react";
import { VersionSelectEntry, type DemoFlowVersion } from "./components/VersionSelectEntry";
import { ConsentGate } from "./components/ConsentGate";
import { StepConsentComplete } from "./components/StepConsentComplete";
import { StepEkycIntro } from "./components/StepEkycIntro";
import { Step1PersonalInfo } from "./components/Step1PersonalInfo";
import { Step2BankRegistration } from "./components/Step2BankRegistration";
import { Step3IdentityVerification } from "./components/Step3IdentityVerification";
import { StepQrTransition } from "./components/StepQrTransition";
import { StepComplete } from "./components/StepComplete";
import type { PersonalInfoForm, BankInfoForm, IdentityVerificationMethod } from "./types";

type AppStep = "entry" | "consent" | "consent-complete" | "ekyc" | "step1" | "step2" | "step3" | "qr" | "complete";

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
  const [step, setStep]                     = useState<AppStep>("entry");
  const [flowVersion, setFlowVersion]       = useState<DemoFlowVersion | null>(null);
  const [personalInfo, setPersonalInfo]     = useState<PersonalInfoForm>(emptyPersonalInfo);
  const [bankInfo, setBankInfo]             = useState<BankInfoForm>(emptyBankInfo);
  const [identityMethod, setIdentityMethod] = useState<IdentityVerificationMethod | null>(null);

  if (step === "entry") {
    return (
      <VersionSelectEntry
        onSelect={(version) => {
          setFlowVersion(version);
          setStep(version === "choku" ? "consent" : "ekyc");
        }}
      />
    );
  }

  if (step === "consent") {
    return <ConsentGate onProceed={() => setStep("consent-complete")} />;
  }

  if (step === "consent-complete") {
    return <StepConsentComplete onProceed={() => setStep("ekyc")} />;
  }

  if (step === "ekyc") {
    return (
      <StepEkycIntro
        onProceed={() => setStep("step1")}
        onBack={() => setStep(flowVersion === "choku" ? "consent" : "entry")}
      />
    );
  }

  if (step === "step1") {
    return (
      <Step1PersonalInfo
        initialData={personalInfo}
        showTermsField={flowVersion === "seiyaku"}
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

  if (step === "step3") {
    return (
      <Step3IdentityVerification
        initialMethod={identityMethod}
        onChange={setIdentityMethod}
        onProceed={(method) => {
          setIdentityMethod(method);
          setStep("qr");
        }}
        onBack={() => setStep("step2")}
      />
    );
  }

  if (step === "qr") {
    return (
      <StepQrTransition
        onProceed={() => setStep("complete")}
        onBack={() => setStep("step3")}
      />
    );
  }

  if (step === "complete") {
    return <StepComplete />;
  }

  return null;
}
