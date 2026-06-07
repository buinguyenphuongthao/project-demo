import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VersionSelectEntry } from '../VersionSelectEntry';

describe('VersionSelectEntry', () => {
  it('renders the heading', () => {
    render(<VersionSelectEntry onSelect={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /デモバージョンを選択/ })).toBeInTheDocument();
  });

  it('renders both version options with their descriptions', () => {
    render(<VersionSelectEntry onSelect={vi.fn()} />);
    expect(screen.getByText('成約便')).toBeInTheDocument();
    expect(screen.getByText('規約は専用画面で表示されます')).toBeInTheDocument();
    expect(screen.getByText('直便')).toBeInTheDocument();
    expect(screen.getByText('規約はステップ1内で確認します')).toBeInTheDocument();
  });

  it('calls onSelect with "seiyaku" when 成約便 is clicked', () => {
    const onSelect = vi.fn();
    render(<VersionSelectEntry onSelect={onSelect} />);
    fireEvent.click(screen.getByText('成約便'));
    expect(onSelect).toHaveBeenCalledWith('seiyaku');
  });

  it('calls onSelect with "choku" when 直便 is clicked', () => {
    const onSelect = vi.fn();
    render(<VersionSelectEntry onSelect={onSelect} />);
    fireEvent.click(screen.getByText('直便'));
    expect(onSelect).toHaveBeenCalledWith('choku');
  });

  it('does not render a step-progress indicator', () => {
    render(<VersionSelectEntry onSelect={vi.fn()} />);
    expect(screen.queryByText(/ステップ中/)).not.toBeInTheDocument();
  });
});
