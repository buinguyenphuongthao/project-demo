import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step3IdentityVerification } from '../Step3IdentityVerification';

const noop = vi.fn();

describe('Step3IdentityVerification', () => {

  it('renders the section heading 本人確認方法', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    expect(screen.getByRole('heading', { name: /本人確認方法/ })).toBeInTheDocument();
  });

  it('renders the step indicator 4ステップ中 3', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    expect(screen.getByText('4ステップ中 3')).toBeInTheDocument();
  });

  it('renders all three method cards', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    expect(screen.getByText('自撮り＋ICチップ読取')).toBeInTheDocument();
    expect(screen.getByText('マイナンバーカード（JPKI）')).toBeInTheDocument();
    expect(screen.getByText('自撮り＋身分証撮影')).toBeInTheDocument();
  });

  it('renders おすすめ badge on the ic-chip card only', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    const badges = screen.getAllByText('おすすめ');
    expect(badges).toHaveLength(1);
  });

  it('ic-chip card is the first card rendered', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    const titles = [
      screen.getByText('自撮り＋ICチップ読取'),
      screen.getByText('マイナンバーカード（JPKI）'),
      screen.getByText('自撮り＋身分証撮影'),
    ];
    expect(titles[0].compareDocumentPosition(titles[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(titles[1].compareDocumentPosition(titles[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('次へ buttons are disabled with no selection', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    const btns = screen.getAllByRole('button', { name: '次へ' });
    btns.forEach(btn => expect(btn).toBeDisabled());
  });

  it('shows validation hint when 次へ clicked without selection', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(screen.getByText('確認方法を選択してから次へお進みください。')).toBeInTheDocument();
  });

  it('selecting a card enables 次へ and hides hint', () => {
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={noop} />);
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    fireEvent.click(screen.getByText('自撮り＋ICチップ読取'));
    const btns = screen.getAllByRole('button', { name: '次へ' });
    btns.forEach(btn => expect(btn).not.toBeDisabled());
    expect(screen.queryByText('確認方法を選択してから次へお進みください。')).not.toBeInTheDocument();
  });

  it('calls onProceed with ic-chip when that card is selected and 次へ clicked', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={onProceed} onBack={noop} />);
    fireEvent.click(screen.getByText('自撮り＋ICチップ読取'));
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledWith('ic-chip');
  });

  it('calls onProceed with jpki when that card is selected', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={onProceed} onBack={noop} />);
    fireEvent.click(screen.getByText('マイナンバーカード（JPKI）'));
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledWith('jpki');
  });

  it('calls onProceed with selfie-doc when that card is selected', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={onProceed} onBack={noop} />);
    fireEvent.click(screen.getByText('自撮り＋身分証撮影'));
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledWith('selfie-doc');
  });

  it('restores initialMethod selection on mount', () => {
    const onProceed = vi.fn();
    render(<Step3IdentityVerification initialMethod="jpki" onProceed={onProceed} onBack={noop} />);
    const btns = screen.getAllByRole('button', { name: '次へ' });
    btns.forEach(btn => expect(btn).not.toBeDisabled());
    fireEvent.click(btns[0]);
    expect(onProceed).toHaveBeenCalledWith('jpki');
  });

  it('calls onBack when 前のステップに戻る is clicked', () => {
    const onBack = vi.fn();
    render(<Step3IdentityVerification initialMethod={null} onProceed={noop} onBack={onBack} />);
    fireEvent.click(screen.getAllByText('前のステップに戻る')[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

});
