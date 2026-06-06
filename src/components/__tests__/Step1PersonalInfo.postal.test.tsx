import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Step1PersonalInfo } from '../Step1PersonalInfo';
import type { PersonalInfoForm } from '../../types';

const emptyForm: PersonalInfoForm = {
  name: '', kana: '', dobYear: '', dobMonth: '', dobDay: '',
  postalCode: '', prefecture: '', address: '', occupation: '',
  email: '', invoiceNotIssuer: false, invoiceNumber: '',
};

/**
 * Helper: simulate typing into a postal input without going through userEvent
 * (userEvent refuses to type into a disabled element and hangs). We drive
 * onChange directly so the test fails with an assertion error, not a timeout.
 */
function typeIntoPostal(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

describe('Step1PersonalInfo — postal code input', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('postal input is enabled on first render', () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByPlaceholderText('例）1040061');
    expect(input).not.toBeDisabled();
  });

  it('postal input stays enabled immediately after 7-digit blur', async () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByPlaceholderText('例）1040061');

    typeIntoPostal(input, '1234567');
    fireEvent.blur(input);

    // Bug: input is disabled={postalLoading} = true here — this assertion FAILS
    expect(input).not.toBeDisabled();
  });

  it('postal input accepts editing during the address lookup window', async () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByPlaceholderText('例）1040061');

    typeIntoPostal(input, '1234567');
    fireEvent.blur(input);

    // Advance 300 ms — still inside the 900ms lock window
    await act(async () => { vi.advanceTimersByTime(300); });

    // The input should not be disabled so the user can correct the postal code.
    // Bug: postalLoading is still true at 300ms — this assertion FAILS
    expect(input).not.toBeDisabled();
  });

  it('filling in a new 7-digit postal code after the lookup resolves does not re-lock the input', async () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByPlaceholderText('例）1040061');

    // First lookup — let it complete
    typeIntoPostal(input, '1234567');
    fireEvent.blur(input);
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(input).not.toBeDisabled(); // should pass: lock released after 900ms

    // Clear, type new code, blur again
    typeIntoPostal(input, '7654321');
    fireEvent.blur(input);

    // Bug: a second blur with 7 digits re-engages the lock — this assertion FAILS
    expect(input).not.toBeDisabled();
  });

  it('preserves raw composing text during IME composition without stripping', async () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByPlaceholderText('例）1040061') as HTMLInputElement;

    // compositionStart marks the input as composing
    fireEvent.compositionStart(input);
    // During composition onChange fires with interim text that may include non-digits
    fireEvent.change(input, { target: { value: 'あ123' } });
    // Raw composing text should be preserved — not stripped — so IME can finish
    expect(input.value).toBe('あ123');

    // compositionEnd normalizes: strip non-digits, keep only the digits
    fireEvent.compositionEnd(input, { data: 'あ123' });
    expect(input.value).toBe('123');
  });

  it('normalizes full-width digits (１２３) entered via Japanese IME', async () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByPlaceholderText('例）1040061') as HTMLInputElement;

    fireEvent.compositionStart(input);
    fireEvent.change(input, { target: { value: '１２３４５６７' } }); // full-width via IME
    fireEvent.compositionEnd(input, { data: '１２３４５６７' });

    expect(input.value).toBe('1234567');
  });

  it('address lookup fills prefecture and address after 900ms', async () => {
    render(<Step1PersonalInfo initialData={emptyForm} onProceed={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByPlaceholderText('例）1040061');

    typeIntoPostal(input, '1234567');
    fireEvent.blur(input);

    await act(async () => { vi.advanceTimersByTime(900); });

    // Prefecture select and address input should be filled by the mock lookup
    const prefectureSelect = screen.getByDisplayValue('東京都');
    const addressInput = screen.getByDisplayValue('千代田区有楽町');
    expect(prefectureSelect).toBeInTheDocument();
    expect(addressInput).toBeInTheDocument();
  });
});
