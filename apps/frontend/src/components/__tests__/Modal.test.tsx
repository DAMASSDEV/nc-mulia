import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../ui/Modal';

describe('Modal', () => {
  afterEach(() => {
    cleanup();
  });

  describe('isOpen', () => {
    it('renders children when isOpen=true', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal content here</p>
        </Modal>
      );

      expect(screen.getByText('Modal content here')).toBeInTheDocument();
    });

    it('does not render when isOpen=false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <p>Should not see this</p>
        </Modal>
      );

      expect(screen.queryByText('Should not see this')).not.toBeInTheDocument();
    });
  });

  describe('onClose', () => {
    it('calls onClose when backdrop is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Backdrop click test</p>
        </Modal>
      );

      // The backdrop is the motion.div with bg-foreground/40
      const backdrop = screen.getByText('Backdrop click test').parentElement?.parentElement?.previousElementSibling;
      if (backdrop) {
        await user.click(backdrop);
      } else {
        // Fallback: click the outer container's backdrop area
        const overlay = document.body.querySelector('.fixed.inset-0');
        if (overlay) {
          await user.click(overlay as HTMLElement);
        }
      }

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={onClose} showClose={true}>
          <p>Close button test</p>
        </Modal>
      );

      const closeBtn = screen.getByRole('button');
      await user.click(closeBtn);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking modal content', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={onClose}>
          <p>Inner content</p>
        </Modal>
      );

      await user.click(screen.getByText('Inner content'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('size classes', () => {
    it('has max-w-md for size="sm"', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="sm">
          <p>Small modal</p>
        </Modal>
      );

      const modal = document.body.querySelector('.max-w-md');
      expect(modal).toBeTruthy();
    });

    it('has max-w-lg for size="md"', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="md">
          <p>Medium modal</p>
        </Modal>
      );

      const modal = document.body.querySelector('.max-w-lg');
      expect(modal).toBeTruthy();
    });

    it('has max-w-2xl for size="lg"', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="lg">
          <p>Large modal</p>
        </Modal>
      );

      const modal = document.body.querySelector('.max-w-2xl');
      expect(modal).toBeTruthy();
    });
  });

  describe('title', () => {
    it('renders title when provided', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="My Modal Title">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByRole('heading', { level: 2, name: /My Modal Title/i })).toBeInTheDocument();
    });

    it('does not render title when not provided', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>No title</p>
        </Modal>
      );

      // Should still render the close button header area if showClose defaults to true
      // But no h2 heading
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });
  });

  describe('showClose', () => {
    it('hides close button when showClose=false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showClose={false}>
          <p>No close button</p>
        </Modal>
      );

      // Should have only one button (none inside the header)
      // The modal body should not contain a close button
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
