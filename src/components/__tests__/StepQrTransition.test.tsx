import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepQrTransition } from '../StepQrTransition';

describe('StepQrTransition', () => {

  it('renders the main heading', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(
      screen.getByRole('heading', { name: /スマートフォンで本人確認を行ってください/ })
    ).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(
      screen.getByText(/この手順はスマートフォンで完了する必要があります/)
    ).toBeInTheDocument();
  });

  it('renders all three instruction steps', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/スマートフォンのカメラを起動する/)).toBeInTheDocument();
    expect(screen.getByText(/下記のQRコードを読み取る/)).toBeInTheDocument();
    expect(screen.getByText(/D-Confiaアプリが自動的に起動します/)).toBeInTheDocument();
  });

  it('renders the QR code placeholder', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('img', { name: 'QRコード' })).toBeInTheDocument();
  });

  it('renders the timeout hint', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText(/このQRコードは10分間有効です/)).toBeInTheDocument();
  });

  it('renders the 本人確認方法 section heading', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /本人確認方法/ })).toBeInTheDocument();
  });

  it('renders the step indicator 4ステップ中 3', () => {
    render(<StepQrTransition onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('4ステップ中 3')).toBeInTheDocument();
  });

  it('calls onProceed when 次へ is clicked', () => {
    const onProceed = vi.fn();
    render(<StepQrTransition onProceed={onProceed} onBack={vi.fn()} />);
    fireEvent.click(screen.getAllByRole('button', { name: '次へ' })[0]);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when 前のステップに戻る is clicked', () => {
    const onBack = vi.fn();
    render(<StepQrTransition onProceed={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getAllByText('前のステップに戻る')[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

});
