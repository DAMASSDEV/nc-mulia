import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../ui/Button';

describe('Button', () => {
  afterEach(() => {
    cleanup();
  });

  describe('renders children', () => {
    it('renders text children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /Click me/i })).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      render(<Button><span data-testid="a">A</span><span data-testid="b">B</span></Button>);
      expect(screen.getByTestId('a')).toBeInTheDocument();
      expect(screen.getByTestId('b')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('shows loading spinner when loading=true', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByText('Memproses...')).toBeInTheDocument();
      // Spinner element
      expect(screen.getByRole('button').querySelector('.loading-spinner')).toBeTruthy();
    });

    it('hides icon when loading', () => {
      const mockIcon = <svg data-testid="icon" />;
      render(<Button loading icon={mockIcon} iconPosition="left">Submit</Button>);

      expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('hides text children when loading', () => {
      render(<Button loading>Original Text</Button>);
      expect(screen.queryByText('Original Text')).not.toBeInTheDocument();
    });

    it('button is disabled when loading', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('variant classes', () => {
    it('applies primary variant classes', () => {
      render(<Button variant="primary">Primary</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('bg-brand-primary');
    });

    it('applies secondary variant classes', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('border-brand-primary');
      expect(btn).toHaveClass('text-brand-primary');
    });

    it('applies ghost variant classes', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('text-brand-primary');
      expect(btn).toHaveClass('hover:bg-brand-primary-soft');
    });

    it('applies danger variant classes', () => {
      render(<Button variant="danger">Danger</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('bg-danger');
      expect(btn).toHaveClass('text-white');
    });
  });

  describe('disabled prop', () => {
    it('is disabled when disabled=true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies disabled styling', () => {
      render(<Button disabled>Disabled</Button>);
      const btn = screen.getByRole('button');
      // Primary disabled should have reduced opacity class
      expect(btn).toHaveClass('disabled:bg-brand-primary/40');
    });
  });

  describe('size classes', () => {
    it('applies sm size classes', () => {
      render(<Button size="sm">Small</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('text-xs');
      expect(btn).toHaveClass('px-4');
      expect(btn).toHaveClass('py-2');
    });

    it('applies md size classes', () => {
      render(<Button size="md">Medium</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('text-sm');
      expect(btn).toHaveClass('px-5');
    });

    it('applies lg size classes', () => {
      render(<Button size="lg">Large</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toHaveClass('text-base');
      expect(btn).toHaveClass('px-7');
    });
  });

  describe('icon prop', () => {
    it('renders icon on the left by default', () => {
      const mockIcon = <svg data-testid="left-icon"><title>Icon</title></svg>;
      render(<Button icon={mockIcon}>With Icon</Button>);

      const icon = screen.getByTestId('left-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders icon on the right when iconPosition="right"', () => {
      const mockIcon = <svg data-testid="right-icon" />;
      render(<Button icon={mockIcon} iconPosition="right">Right Icon</Button>);

      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });
});
