import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepConsentComplete } from '../StepConsentComplete';

describe('StepConsentComplete', () => {

  it('renders the completion heading', () => {
    render(<StepConsentComplete onProceed={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /同意書の受諾が完了しました/ })).toBeInTheDocument();
  });

  it('explains that the eKYC invitation will arrive by email', () => {
    render(<StepConsentComplete onProceed={vi.fn()} />);
    expect(screen.getByText(/本人確認（eKYC）のご案内を、追ってメールにてお送りいたします。/)).toBeInTheDocument();
  });

  it('renders the tester-only navigation button and explanatory note', () => {
    render(<StepConsentComplete onProceed={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'eKYC画面へ進む（テスター用）' })).toBeInTheDocument();
    expect(screen.getByText(/このボタンはデモ・テスト用です/)).toBeInTheDocument();
  });

  it('calls onProceed when the tester button is clicked', () => {
    const onProceed = vi.fn();
    render(<StepConsentComplete onProceed={onProceed} />);
    fireEvent.click(screen.getByRole('button', { name: 'eKYC画面へ進む（テスター用）' }));
    expect(onProceed).toHaveBeenCalledTimes(1);
  });

  it('renders the customer center contact section', () => {
    render(<StepConsentComplete onProceed={vi.fn()} />);
    expect(screen.getByText('カスタマーセンター')).toBeInTheDocument();
    expect(screen.getByText('0120-945-991')).toBeInTheDocument();
  });
});
