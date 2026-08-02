import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { User, Consultation, Transaction } from '../../types';

// ── Mock fetch at browser level ────────────────────────────────────────────────
const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

import DashboardPage from '../DashboardPage';

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 'u1',
  name: 'Budi Santoso',
  email: 'budi@nc-mulia.local',
  role: 'user',
  membershipStatus: 'regular',
  ...overrides,
});

function renderDashboard(user: User) {
  return render(
    <BrowserRouter>
      <DashboardPage user={user} />
    </BrowserRouter>
  );
}

function makeResponse(data: unknown) {
  return new Response(JSON.stringify({ success: true, message: 'OK', data }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

async function renderDashboardAndFlush(user: User) {
  const result = renderDashboard(user);
  await act(async () => {
    await new Promise(r => setTimeout(r, 0));
  });
  return result;
}

describe('DashboardPage', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue(makeResponse([]));
  });

  it('shows user name from props', () => {
    renderDashboard(makeUser({ name: 'Budi Santoso' }));

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Budi Santoso');
    expect(screen.getByText('budi@nc-mulia.local')).toBeInTheDocument();
  });

  it('shows member badge when membershipStatus === "member"', () => {
    renderDashboard(makeUser({ membershipStatus: 'member', membershipExpiresAt: '2027-01-01T00:00:00Z' }));

    expect(screen.getByText('Member Herbalife')).toBeInTheDocument();
    expect(screen.getByText('Membership Aktif')).toBeInTheDocument();
  });

  it('shows "Upgrade" card when not a member', () => {
    renderDashboard(makeUser({ membershipStatus: 'regular' }));

    expect(screen.getByRole('link', { name: /Upgrade ke Member Herbalife$/i })).toBeInTheDocument();
  });

  it('does NOT show member badge when not a member', () => {
    renderDashboard(makeUser({ membershipStatus: 'regular' }));

    expect(screen.queryByText('Member Herbalife')).not.toBeInTheDocument();
  });

  it('loads consultation history from API and displays items', async () => {
    const consults: Consultation[] = [
      { id: 'c1', question: 'Bagaimana cara menurunkan berat badan?', status: 'answered', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z', response: 'Olahraga rutin.' },
      { id: 'c2', question: 'Apakah boleh puasa?', status: 'pending', createdAt: '2026-07-02T00:00:00Z', updatedAt: '2026-07-02T00:00:00Z' },
    ];

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/consultations')) {
        return Promise.resolve(makeResponse(consults));
      }
      return Promise.resolve(makeResponse([]));
    });

    await renderDashboardAndFlush(makeUser());

    await waitFor(() => {
      expect(screen.getByText('Bagaimana cara menurunkan berat badan?')).toBeInTheDocument();
    });
  });

  it('loads BMI history from API', async () => {
    const bmiRecords = [{ id: 'b1', weightKg: 75, heightCm: 175, bmiValue: 24.5, bmiCategory: 'Normal', createdAt: '2026-07-01T00:00:00Z' }];

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/bmi/history')) {
        return Promise.resolve(makeResponse(bmiRecords));
      }
      return Promise.resolve(makeResponse([]));
    });

    await renderDashboardAndFlush(makeUser());

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const bmiCalls = mockFetch.mock.calls.filter((call) => (call[0] as string).includes('/bmi/history'));
      expect(bmiCalls.length).toBeGreaterThan(0);
    });
  });

  it('shows stats numbers after loading', () => {
    renderDashboard(makeUser());

    expect(screen.getAllByText(/Konsultasi/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/BMI Record/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Transaksi/)[0]).toBeInTheDocument();
  });

  it('quick action links use <a> elements (Link renders as <a> in test env)', () => {
    renderDashboard(makeUser());

    const quickActionLinks = screen.getAllByRole('link').filter(a =>
      ['/konsultasi', '/bmi', '/produk-herbalife', '/riwayat'].includes(a.getAttribute('href') ?? '')
    );

    expect(quickActionLinks.length).toBeGreaterThanOrEqual(4);
    for (const link of quickActionLinks) {
      expect(link.tagName.toLowerCase()).toBe('a');
    }
  });

  it('upgrade button link has href="/membership"', () => {
    renderDashboard(makeUser({ membershipStatus: 'regular' }));

    const upgradeLink = screen.getByRole('link', { name: /Upgrade ke Member Herbalife/i });
    expect(upgradeLink).toHaveAttribute('href', '/membership');
  });
});
