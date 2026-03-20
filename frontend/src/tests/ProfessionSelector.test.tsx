import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfessionSelector from '../components/ProfessionSelector';

describe('ProfessionSelector Component', () => {
  const roles = ["Farmer", "Student"];
  const onSelect = vi.fn();

  it('renders all profession tabs correctly', () => {
    render(
      <ProfessionSelector 
        roles={roles} 
        selectedRole="Farmer" 
        onSelect={onSelect} 
      />
    );
    expect(screen.getByText(/Farmer/i)).toBeInTheDocument();
    expect(screen.getByText(/Student/i)).toBeInTheDocument();
  });

  it('highlights the selected profession', () => {
    render(
      <ProfessionSelector 
        roles={roles} 
        selectedRole="Student" 
        onSelect={onSelect} 
      />
    );
    const studentBtn = screen.getByRole('tab', { selected: true });
    expect(studentBtn).toHaveTextContent(/Student/i);
    expect(studentBtn).toHaveClass('text-blue-700');
  });

  it('triggers onSelect when a profession is clicked', () => {
    render(
      <ProfessionSelector 
        roles={roles} 
        selectedRole="Farmer" 
        onSelect={onSelect} 
      />
    );
    fireEvent.click(screen.getByText(/Student/i));
    expect(onSelect).toHaveBeenCalledWith("Student");
  });

  it('has accessible ARIA roles', () => {
    render(
      <ProfessionSelector 
        roles={roles} 
        selectedRole="Farmer" 
        onSelect={onSelect} 
      />
    );
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });
});
