import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SchemeDetailModal from '../components/SchemeDetailModal';

describe('SchemeDetailModal Component', () => {
    const mockScheme = {
        name: "PM-KISAN",
        score: 98,
        amount: "₹6,000 / Year",
        intro: "Direct income support for farmers.",
        eligibility: ["Landholding farmer families"],
        timeline: "Ongoing",
        documents: ["Aadhaar", "Land Records"],
        link: "https://pmkisan.gov.in"
    };

    const onClose = vi.fn();

    it('renders scheme name and intro correctly', () => {
        render(<SchemeDetailModal scheme={mockScheme} onClose={onClose} />);
        expect(screen.getByText(/PM-KISAN/i)).toBeInTheDocument();
        expect(screen.getByText(/Direct income support/i)).toBeInTheDocument();
    });

    it('renders eligibility items in a list', () => {
        render(<SchemeDetailModal scheme={mockScheme} onClose={onClose} />);
        expect(screen.getByText(/Landholding farmer families/i)).toBeInTheDocument();
    });

    it('renders the official portal link', () => {
        render(<SchemeDetailModal scheme={mockScheme} onClose={onClose} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://pmkisan.gov.in');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('calls onClose when the close button is clicked', () => {
        render(<SchemeDetailModal scheme={mockScheme} onClose={onClose} />);
        const closeBtn = screen.getByLabelText(/Close modal/i);
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('has ARIA role of dialog and aria-modal="true"', () => {
        render(<SchemeDetailModal scheme={mockScheme} onClose={onClose} />);
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
});
