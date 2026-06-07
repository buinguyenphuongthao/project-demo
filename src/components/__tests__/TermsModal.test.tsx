import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TermsModal } from '../TermsModal';

describe('TermsModal', () => {
  it('renders nothing when closed', () => {
    render(<TermsModal open={false} agreed={false} onAgreedChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.queryByText('利用規約')).not.toBeInTheDocument();
  });

  it('renders the terms content when open', () => {
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('heading', { name: '利用規約' })).toBeInTheDocument();
    expect(screen.getByText(/本規約は、株式会社マーケットエンタープライズ/)).toBeInTheDocument();
  });

  it('reflects the agreed prop in the checkbox', () => {
    render(<TermsModal open={true} agreed={true} onAgreedChange={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onAgreedChange when the checkbox is toggled', () => {
    const onAgreedChange = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={onAgreedChange} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onAgreedChange).toHaveBeenCalledWith(true);
  });

  it('calls onClose when the × button is clicked', () => {
    const onClose = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'モーダルを閉じる' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the 閉じる button is clicked', () => {
    const onClose = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the Escape key is pressed', () => {
    const onClose = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the Escape key is pressed while closed', () => {
    const onClose = vi.fn();
    render(<TermsModal open={false} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when clicking inside the panel', () => {
    const onClose = vi.fn();
    render(<TermsModal open={true} agreed={false} onAgreedChange={vi.fn()} onClose={onClose} />);
    fireEvent.click(screen.getByRole('heading', { name: '利用規約' }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
