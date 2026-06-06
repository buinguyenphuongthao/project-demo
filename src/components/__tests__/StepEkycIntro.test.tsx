import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StepEkycIntro } from '../StepEkycIntro';

describe('StepEkycIntro', () => {

  it('renders the hero heading', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /ご本人確認のお手続き/ })).toBeInTheDocument();
  });

  it('renders all three document types', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('運転免許証')).toBeInTheDocument();
    expect(screen.getByText('マイナンバーカード')).toBeInTheDocument();
    expect(screen.getByText('在留カード')).toBeInTheDocument();
  });

  it('does NOT render パスポート', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByText('パスポート')).not.toBeInTheDocument();
  });

  it('shows the マイナンバーカード badge ※表面のみ', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('※表面のみ')).toBeInTheDocument();
  });

  it('eKYCとは？ body starts collapsed — shows もっと見る toggle', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('もっと見る')).toBeInTheDocument();
  });

  it('eKYCとは？ expands on toggle click and shows 閉じる', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('もっと見る'));
    expect(screen.getByText('閉じる')).toBeInTheDocument();
    expect(screen.queryByText('もっと見る')).not.toBeInTheDocument();
  });

  it('collapses again when 閉じる is clicked', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByText('もっと見る'));
    fireEvent.click(screen.getByText('閉じる'));
    expect(screen.getByText('もっと見る')).toBeInTheDocument();
  });

  it('calls onProceed when CTA is clicked', () => {
    const onProceed = vi.fn();
    render(<StepEkycIntro onProceed={onProceed} onBack={vi.fn()} />);
    fireEvent.click(screen.getAllByText('本人確認へ進む')[0]);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when back link is clicked', () => {
    const onBack = vi.fn();
    render(<StepEkycIntro onProceed={vi.fn()} onBack={onBack} />);
    fireEvent.click(screen.getAllByText('前のステップに戻る')[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does NOT render any step-progress indicator', () => {
    render(<StepEkycIntro onProceed={vi.fn()} onBack={vi.fn()} />);
    expect(screen.queryByText(/ステップ中/)).not.toBeInTheDocument();
  });

});
