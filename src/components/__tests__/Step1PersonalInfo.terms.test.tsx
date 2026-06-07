import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step1PersonalInfo } from '../Step1PersonalInfo';
import type { PersonalInfoForm } from '../../types';

const emptyForm: PersonalInfoForm = {
  name: '', kana: '', dobYear: '', dobMonth: '', dobDay: '',
  postalCode: '', prefecture: '', address: '', occupation: '',
  email: '', invoiceNotIssuer: false, invoiceNumber: '',
};

describe('Step1PersonalInfo — inline terms field (showTermsField)', () => {
  it('does not render the 利用規約 field by default', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByText('利用規約')).not.toBeInTheDocument();
  });

  it('renders the 利用規約 field with required badge and "not yet agreed" status when showTermsField is true', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} showTermsField />);
    expect(screen.getByText('利用規約')).toBeInTheDocument();
    expect(screen.getByText('内容を確認して同意する')).toBeInTheDocument();
  });

  it('opens the terms modal when the field row is tapped', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} showTermsField />);
    fireEvent.click(screen.getByText('内容を確認して同意する'));
    expect(screen.getByRole('heading', { name: '利用規約' })).toBeInTheDocument();
  });

  it('shows "✓ 同意済み" after checking agree in the modal and closing it', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} showTermsField />);
    fireEvent.click(screen.getByText('内容を確認して同意する'));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('checkbox'));
    fireEvent.click(within(dialog).getByRole('button', { name: '閉じる' }));
    expect(screen.getByText('✓ 同意済み')).toBeInTheDocument();
  });
});
