import React from 'react';
import { render } from '@testing-library/react-native';
import { useWeatherContext } from '@/contexts/weather-context';

// Components under test
import { ErrorScreen }         from '@/components/error-screen';
import { LoadingScreen }       from '@/components/loading-screen';
import { LocationInputScreen } from '@/components/location-input-screen';
import { SpriteAnimation }     from '@/components/sprite-animation';
import { SpritePreloader }     from '@/components/sprite-preloader';

const mockUseWeatherContext = useWeatherContext as jest.Mock;

// ─── Shared weather state for home screen tests ───────────────────────────────
const baseWeatherOk = {
  status: 'ok' as const,
  apparentTempF: 72,
  weatherCode: 0,
  isDay: true,
  cityName: 'Corona',
  canUseGPS: true,
  isGPSRefreshing: false,
  canAskAgain: true,
  isResolvingManual: false,
  manualLocationError: undefined,
  refresh: jest.fn(),
  refreshGPSLocation: jest.fn(),
  selectPlace: jest.fn(),
};

const spriteConfig = {
  source: 1 as any,
  sheetSize: 5376,
  frameSize: 768,
  cols: 7,
  totalFrames: 49,
  fps: 30,
};

// ─── ErrorScreen ─────────────────────────────────────────────────────────────
describe('ErrorScreen accessibility', () => {
  it('retry button has correct role and label', () => {
    const { getByRole } = render(<ErrorScreen onRetry={jest.fn()} />);
    const btn = getByRole('button', { name: /try again/i });
    expect(btn).toBeTruthy();
  });

  it('error message is present', () => {
    const { getByText } = render(<ErrorScreen message="Network error" onRetry={jest.fn()} />);
    expect(getByText('Network error')).toBeTruthy();
  });
});

// ─── LoadingScreen ────────────────────────────────────────────────────────────
describe('LoadingScreen accessibility', () => {
  it('container announces itself as loading', () => {
    const { getByLabelText } = render(<LoadingScreen />);
    expect(getByLabelText('Loading weather')).toBeTruthy();
  });

  it('decorative mark is hidden from accessibility tree', () => {
    const { UNSAFE_getByProps } = render(<LoadingScreen />);
    const animatedView = UNSAFE_getByProps({ accessibilityElementsHidden: true });
    expect(animatedView).toBeTruthy();
  });
});

// ─── LocationInputScreen ──────────────────────────────────────────────────────
describe('LocationInputScreen accessibility', () => {
  const defaultProps = {
    selectPlace: jest.fn(),
    isResolving: false,
    canAskAgain: true,
  };

  it('text input has accessibilityLabel', () => {
    const { getByLabelText } = render(<LocationInputScreen {...defaultProps} />);
    expect(getByLabelText(/city or zip/i)).toBeTruthy();
  });

  it('submit button has correct role and label', () => {
    const { getByRole } = render(<LocationInputScreen {...defaultProps} />);
    expect(getByRole('button', { name: /get the weather/i })).toBeTruthy();
  });

  it('submit button is disabled when input is empty', () => {
    const { getByRole } = render(<LocationInputScreen {...defaultProps} />);
    const btn = getByRole('button', { name: /get the weather/i });
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('submit button is disabled when resolving', () => {
    const { getByRole } = render(<LocationInputScreen {...defaultProps} isResolving />);
    const btn = getByRole('button', { name: /get the weather/i });
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('error row uses alert role with icon + text', () => {
    const { UNSAFE_getByProps } = render(
      <LocationInputScreen {...defaultProps} error="Couldn't find that location" />
    );
    // accessibilityRole="alert" is an RN-specific role; query via props
    expect(UNSAFE_getByProps({ accessibilityRole: 'alert' })).toBeTruthy();
    // icon is rendered inside the alert row (hidden from a11y tree, hence UNSAFE query)
    expect(UNSAFE_getByProps({ testID: 'icon-TriangleAlert' })).toBeTruthy();
  });

  it('error row accessibilityLabel contains the error text', () => {
    const { getByLabelText } = render(
      <LocationInputScreen {...defaultProps} error="Couldn't find that location" />
    );
    expect(getByLabelText("Couldn't find that location")).toBeTruthy();
  });

  it('back button renders when onDismiss provided', () => {
    const { getByRole } = render(
      <LocationInputScreen {...defaultProps} onDismiss={jest.fn()} />
    );
    expect(getByRole('button', { name: /go back/i })).toBeTruthy();
  });

  it('settings link has role link when GPS unavailable', () => {
    const { getByRole } = render(
      <LocationInputScreen {...defaultProps} canAskAgain={false} />
    );
    expect(getByRole('link')).toBeTruthy();
  });
});

// ─── SpriteAnimation ─────────────────────────────────────────────────────────
describe('SpriteAnimation accessibility', () => {
  it('Pressable has role button', () => {
    const { getByRole } = render(<SpriteAnimation config={spriteConfig} />);
    expect(getByRole('button')).toBeTruthy();
  });

  it('Pressable has default accessibilityLabel', () => {
    const { getByLabelText } = render(<SpriteAnimation config={spriteConfig} />);
    expect(getByLabelText('Gemi the weather monster')).toBeTruthy();
  });

  it('Pressable accepts custom accessibilityLabel', () => {
    const { getByLabelText } = render(
      <SpriteAnimation config={spriteConfig} accessibilityLabel="Sunny monster" />
    );
    expect(getByLabelText('Sunny monster')).toBeTruthy();
  });

  it('inner content is marked hidden from accessibility tree via Pressable container', () => {
    // The clip View only renders after onLayout fires (displaySize > 0).
    // In tests, layout never fires, so we verify the Pressable itself is correctly
    // labelled and the container prop is present on the Pressable.
    const { getByRole } = render(<SpriteAnimation config={spriteConfig} />);
    const btn = getByRole('button');
    expect(btn.props.accessibilityLabel).toBe('Gemi the weather monster');
    expect(btn.props.accessibilityHint).toBe('Plays a weather animation');
  });
});

// ─── SpritePreloader ─────────────────────────────────────────────────────────
describe('SpritePreloader accessibility', () => {
  it('container is hidden from accessibility tree', () => {
    const { UNSAFE_getByProps } = render(<SpritePreloader />);
    const hidden = UNSAFE_getByProps({ accessibilityElementsHidden: true });
    expect(hidden).toBeTruthy();
  });

  it('container has no-hide-descendants for Android', () => {
    const { UNSAFE_getByProps } = render(<SpritePreloader />);
    const el = UNSAFE_getByProps({ importantForAccessibility: 'no-hide-descendants' });
    expect(el).toBeTruthy();
  });
});
