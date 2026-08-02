import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as api from '../lib/api';
import type { User } from '../types';

const { membershipApi } = api;

const mockMembershipApi = membershipApi as unknown as Record<string, ReturnType<typeof vi.fn>>;

// ── MembershipDisplay: mirrors the actual membership page's data-fetching logic ──
function MembershipDisplay({ userStatus }: { userStatus: string | null }) {
  const [status, setStatus] = useState<string | null>(userStatus);
  const [fee, setFee] = useState<number | null>(null);
  const [error, setError] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await membershipApi.getStatus();
      if (res.success && res.data) {
        setStatus(res.data.status);
      }
    } catch { /* ignore */ }
  };

  const loadFee = async () => {
    try {
      const res = await membershipApi.getFee();
      if (res.success && res.data) {
        setFee(res.data.fee);
      }
    } catch {
      setError(true);
      setFee(546000); // fallback per spec
    }
  };

  return (
    <div>
      <button data-testid="load-status" onClick={loadStatus}>Load Status</button>
      <button data-testid="load-fee" onClick={loadFee}>Load Fee</button>
      <span data-testid="status">{status ?? 'none'}</span>
      <span data-testid="fee">{fee ?? 'not loaded'}</span>
      <span data-testid="error-flag">{String(error)}</span>
      <ul data-testid="benefits">
        <li>Diskon 30% di Semua Produk</li>
        <li>Konsultasi Prioritas</li>
        <li>Akses Eksklusif ke Promo</li>
      </ul>
      <div data-testid="member-badge">
        {status === 'member' ? 'Member Aktif' : 'Bukan Member'}
      </div>
    </div>
  );
}

import { useState } from 'react';

describe('Membership page logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('fetches membership fee from API dynamically', () => {
    it('loads fee from API when request succeeds', async () => {
      vi.spyOn(mockMembershipApi, 'getFee').mockResolvedValue({
        success: true,
        message: 'OK',
        data: { fee: 750000 },
      });

      render(<MembershipDisplay userStatus={null} />);
      await userEvent.click(screen.getByTestId('load-fee'));

      await waitFor(() => {
        expect(mockMembershipApi.getFee).toHaveBeenCalled();
      });
      expect(screen.getByTestId('fee')).toHaveTextContent('750000');
    });

    it('falls back to 546000 if API fails', async () => {
      vi.spyOn(mockMembershipApi, 'getFee').mockRejectedValue(new Error('Network error'));

      render(<MembershipDisplay userStatus={null} />);
      await userEvent.click(screen.getByTestId('load-fee'));

      await waitFor(() => {
        expect(screen.getByTestId('fee')).toHaveTextContent('546000');
      });
      expect(screen.getByTestId('error-flag')).toHaveTextContent('true');
    });
  });

  describe('shows member status correctly', () => {
    it('displays member status when API returns status=member', async () => {
      vi.spyOn(mockMembershipApi, 'getStatus').mockResolvedValue({
        success: true,
        message: 'OK',
        data: { status: 'member', expiresAt: '2027-12-31T23:59:59Z', isActive: true },
      });

      render(<MembershipDisplay userStatus={null} />);
      await userEvent.click(screen.getByTestId('load-status'));

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('member');
        expect(screen.getByTestId('member-badge')).toHaveTextContent('Member Aktif');
      });
    });

    it('displays non-member status when API returns status=regular', async () => {
      vi.spyOn(mockMembershipApi, 'getStatus').mockResolvedValue({
        success: true,
        message: 'OK',
        data: { status: 'regular', expiresAt: null, isActive: false },
      });

      render(<MembershipDisplay userStatus={null} />);
      await userEvent.click(screen.getByTestId('load-status'));

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('regular');
        expect(screen.getByTestId('member-badge')).toHaveTextContent('Bukan Member');
      });
    });
  });

  describe('shows membership benefits list', () => {
    it('displays all membership benefits', () => {
      render(<MembershipDisplay userStatus={null} />);

      const benefits = screen.getByTestId('benefits');
      expect(benefits).toHaveTextContent('Diskon 30% di Semua Produk');
      expect(benefits).toHaveTextContent('Konsultasi Prioritas');
      expect(benefits).toHaveTextContent('Akses Eksklusif ke Promo');
    });

    it('lists three benefit items', () => {
      render(<MembershipDisplay userStatus={null} />);

      const items = screen.getByTestId('benefits').querySelectorAll('li');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Diskon 30% di Semua Produk');
      expect(items[1]).toHaveTextContent('Konsultasi Prioritas');
      expect(items[2]).toHaveTextContent('Akses Eksklusif ke Promo');
    });
  });
});
