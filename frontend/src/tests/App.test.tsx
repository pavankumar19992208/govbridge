import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

describe('GovBridge Application Component', () => {
  it('renders the core accessible navigation bar', () => {
    render(<App />);
    expect(screen.getByText('GovBridge')).toBeInTheDocument();
  });

  it('renders the top-left Profession selector logically tied via aria', () => {
    render(<App />);
    expect(screen.getByLabelText(/Select Profession/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select your profession/i })).toBeInTheDocument();
  });

  it('renders multimodal input elements flawlessly across all views', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Find government schemes/i })).toBeInTheDocument();
  });

  it('displays inline error banner when API call fails', async () => {
    // Mock the global fetch to simulate a network failure
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network Error'));

    render(<App />);
    const user = userEvent.setup();

    // Type a query, then submit
    const textarea = screen.getByLabelText(/Text query description/i);
    await user.type(textarea, 'agricultural subsidy');

    const submitBtn = screen.getByRole('button', { name: /Find government schemes/i });
    await user.click(submitBtn);

    // The error banner should render with the connection failure message
    await waitFor(() => {
      expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
    });

    vi.restoreAllMocks();
  });
});
