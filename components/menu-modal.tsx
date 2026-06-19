import type { ProductIOS } from 'expo-iap';
import { ACK_SECTIONS } from '@/constants/acknowledgements';
import { TIP_TIERS, TIP_PRODUCT_IDS } from '@/constants/iap';
import { strings } from '@/constants/strings';
import { color, duration, fonts, fontSize, iconSize, radius, spacing, zIndex } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as StoreReview from 'expo-store-review';
import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let IAPModule: typeof import('expo-iap') | null = null;
try { IAPModule = require('expo-iap'); } catch {}

type Phase = 'menu' | 'acknowledgements' | 'tip-jar';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  isDay: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ACK_HEIGHT    = SCREEN_HEIGHT - 85;
const CLOSED_OFFSET = SCREEN_HEIGHT;

// Spring specs derived from design: response=0.42 dampingFraction=0.82
const CLOSE_SPRING = { stiffness: 224, damping: 24.5, mass: 1, reduceMotion: ReduceMotion.System };
// Spring for row tap feedback: response=0.3 dampingFraction=0.7
const ROW_SPRING   = { stiffness: 438, damping: 29,   mass: 1, reduceMotion: ReduceMotion.System };
// Phase slide timing
const PUSH_TIMING  = { duration: 280, easing: Easing.inOut(Easing.ease) };

// ─── Theme helper ─────────────────────────────────────────────────────────────

function buildTheme(isNight: boolean) {
  if (!isNight || Platform.OS !== 'ios') {
    return {
      text:       color.ink,
      secondary:  'rgba(60,60,67,0.6)',
      tertiary:   'rgba(60,60,67,0.3)',
      rowBg:      'rgba(255,255,255,0.72)' as const,
      sheetBg:    Platform.OS === 'ios' ? ('transparent' as const) : color.surfaceSheet,
      blurTint:   'systemUltraThinMaterialLight' as const,
      dragHandle: 'rgba(60,60,67,0.4)' as const,
    };
  }
  return {
    text:       '#FFFFFF',
    secondary:  'rgba(235,235,245,0.6)',
    tertiary:   'rgba(235,235,245,0.3)',
    rowBg:      'rgba(44,44,46,0.72)' as const,
    sheetBg:    'transparent' as const,
    blurTint:   'systemUltraThinMaterialDark' as const,
    dragHandle: 'rgba(235,235,245,0.4)' as const,
  };
}

type Theme = ReturnType<typeof buildTheme>;

// ─── Sub-components ──────────────────────────────────────────────────────────

function CircleButton({ icon, onPress, label, theme }: {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
  label: string;
  theme: Theme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.circleBtn, { backgroundColor: theme.rowBg }]}
      hitSlop={spacing.xs}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialIcons name={icon} size={iconSize.sm} color={theme.text} />
    </Pressable>
  );
}

function PhaseHeader({ title, onBack, theme }: {
  title: string;
  onBack: () => void;
  theme: Theme;
}) {
  return (
    <View style={styles.phaseHeader}>
      <CircleButton icon="arrow-back" onPress={onBack} label="Go back" theme={theme} />
      <Text style={[styles.phaseTitle, { fontFamily: fonts.bold, color: theme.text }]}>{title}</Text>
    </View>
  );
}

function MenuRow({ label, onPress, icon, iconSymbol, theme }: {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  iconSymbol?: ComponentProps<typeof IconSymbol>['name'];
  theme: Theme;
}) {
  const scale      = useSharedValue(1);
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // Android uses the original light-theme palette; the theme prop is iOS-only.
  if (Platform.OS !== 'ios') {
    return (
      <Pressable
        style={styles.androidRow}
        onPress={onPress}
        hitSlop={spacing.xxs}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.rowLeft}>
          {iconSymbol
            ? <IconSymbol name={iconSymbol} size={iconSize.sm} color={color.ink} />
            : <MaterialIcons name={icon!} size={iconSize.sm} color={color.ink} />
          }
          <Text style={[styles.rowLabel, { fontFamily: fonts.regular, color: color.ink }]}>{label}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={iconSize.sm} color={color.ink} />
      </Pressable>
    );
  }

  return (
    <Animated.View style={[styles.rowCard, { backgroundColor: theme.rowBg }, scaleStyle]}>
      <Pressable
        style={styles.rowInner}
        onPressIn={() => { scale.value = withSpring(0.97, ROW_SPRING); }}
        onPressOut={() => { scale.value = withSpring(1.0, ROW_SPRING); }}
        onPress={onPress}
        hitSlop={spacing.xxs}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={styles.rowLeft}>
          {iconSymbol
            ? <IconSymbol name={iconSymbol} size={iconSize.sm} color={theme.secondary} />
            : <MaterialIcons name={icon!} size={iconSize.sm} color={theme.secondary} />
          }
          <Text style={[styles.rowLabel, { fontFamily: fonts.semibold, color: theme.text }]}>{label}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={iconSize.sm} color={theme.tertiary} />
      </Pressable>
    </Animated.View>
  );
}

function TierRow({ tier, displayPrice, onPurchase, index, theme }: {
  tier: typeof TIP_TIERS[number];
  displayPrice: string;
  onPurchase: (id: string) => void;
  index: number;
  theme: Theme;
}) {
  const opacity = useSharedValue(0);
  const ty      = useSharedValue(12);
  const scale   = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withSpring(1, ROW_SPRING));
    ty.value      = withDelay(index * 60, withSpring(0, ROW_SPRING));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.rowCard, { backgroundColor: theme.rowBg }, animStyle]}>
      <Pressable
        style={styles.rowInner}
        onPressIn={() => { scale.value = withSpring(0.97, ROW_SPRING); }}
        onPressOut={() => { scale.value = withSpring(1.0, ROW_SPRING); }}
        onPress={() => onPurchase(tier.id)}
        accessibilityRole="button"
        accessibilityLabel={`${tier.label} – ${displayPrice}`}
      >
        <View style={styles.rowLeft}>
          <Text style={styles.tierEmoji}>{tier.emoji}</Text>
          <View>
            <Text style={[styles.tierLabel, { fontFamily: fonts.bold, color: theme.text }]}>{tier.label}</Text>
            <Text style={[styles.tierDesc,  { fontFamily: fonts.regular, color: theme.secondary }]}>{tier.desc}</Text>
          </View>
        </View>
        <Text style={[styles.tierPrice, { fontFamily: fonts.black, color: theme.text }]}>{displayPrice}</Text>
      </Pressable>
    </Animated.View>
  );
}

function TipJarContent({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [products, setProducts] = useState<ProductIOS[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [thankYou, setThankYou] = useState(false);

  useEffect(() => {
    if (!IAPModule) { setLoading(false); return; }

    async function load() {
      try {
        await IAPModule!.initConnection();
        const prods = await IAPModule!.fetchProducts({ skus: [...TIP_PRODUCT_IDS], type: 'in-app' });
        const sorted = ((prods as ProductIOS[]) ?? []).sort(
          (a, b) => TIP_PRODUCT_IDS.indexOf(a.id as typeof TIP_PRODUCT_IDS[number]) - TIP_PRODUCT_IDS.indexOf(b.id as typeof TIP_PRODUCT_IDS[number])
        );
        setProducts(sorted);
      } catch (e) {
        if (__DEV__) console.warn('[TipJar] fetchProducts failed:', e);
      }
      setLoading(false);
    }

    const sub = IAPModule.purchaseUpdatedListener(async (purchase: any) => {
      try {
        await IAPModule!.finishTransaction({ purchase, isConsumable: true });
        setThankYou(true);
      } catch (e) {
        if (__DEV__) console.warn('[TipJar] finishTransaction failed:', e);
      }
    });

    load();
    return () => {
      sub.remove();
      IAPModule?.endConnection?.();
    };
  }, []);

  async function purchase(id: string) {
    if (!IAPModule) return;
    try {
      await IAPModule.requestPurchase({
        type: 'in-app',
        request: { apple: { sku: id }, google: { skus: [id] } },
      });
    } catch (e) {
      if (__DEV__) console.warn('[TipJar] requestPurchase failed:', e);
    }
  }

  return (
    <>
      <PhaseHeader title={strings.menu_support} onBack={onBack} theme={theme} />

      {thankYou ? (
        <Text style={[styles.tipThankYou, { fontFamily: fonts.regular, color: theme.text }]}>
          {strings.tip_thank_you}
        </Text>
      ) : (
        <>
          <Text style={[styles.tipSubtitle, { fontFamily: fonts.regular, color: theme.secondary }]}>
            {strings.tip_subtitle}
          </Text>

          {loading ? null : products.length === 0 ? (
            <Text style={[styles.tipUnavailable, { fontFamily: fonts.regular, color: theme.secondary }]}>
              {strings.tip_unavailable}
            </Text>
          ) : (
            <View style={styles.rowGroup}>
              {products.map((p, i) => {
                const tierMeta = TIP_TIERS.find(t => t.id === p.id) ?? TIP_TIERS[i];
                return (
                  <TierRow
                    key={p.id}
                    tier={tierMeta}
                    displayPrice={p.displayPrice ?? p.id}
                    onPurchase={purchase}
                    index={i}
                    theme={theme}
                  />
                );
              })}
            </View>
          )}

        </>
      )}
    </>
  );
}

function AckContent({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  return (
    <>
      <PhaseHeader title={strings.menu_acknowledgements} onBack={onBack} theme={theme} />
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ackScrollContent}
      >
        {ACK_SECTIONS.map(section => (
          <View key={section.header} style={styles.ackSection}>
            <Text style={[styles.sectionHeader, { fontFamily: fonts.semibold, color: theme.secondary }]}>{section.header}</Text>
            <View style={[styles.ackCard, { backgroundColor: theme.rowBg }]}>
              {section.items.map((item, i) => (
                <View key={item.name}>
                  {i > 0 && (
                    <View style={[styles.hairline, { backgroundColor: theme.tertiary }]} />
                  )}
                  <Pressable
                    style={styles.rowInner}
                    onPress={() => Linking.openURL(item.url)}
                    accessibilityRole="link"
                    accessibilityLabel={item.name}
                  >
                    <Text style={[styles.ackName, { fontFamily: fonts.regular, color: theme.text }]}>
                      {item.name}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export function MenuModal({ visible, onClose, isDay }: MenuModalProps) {
  const insets       = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [phase,  setPhase]  = useState<Phase>('menu');
  const [active, setActive] = useState(false);

  const isNight = !isDay && Platform.OS === 'ios';
  const theme   = useMemo(() => buildTheme(isNight), [isNight]);

  // Version label built from native runtime values — never hardcoded
  const appVersion  = Constants.nativeAppVersion  ?? Constants.expoConfig?.version ?? '—';
  const buildNum    = Constants.nativeBuildVersion;
  const versionLabel = buildNum
    ? `Gemi Weather • Version ${appVersion} (Build ${buildNum})`
    : `Gemi Weather • Version ${appVersion}`;

  const sheetH = useSharedValue(0);
  const phaseRef  = useRef<Phase>('menu');
  const measuredH = useRef<Partial<Record<Phase, number>>>({});

  const translateY      = useSharedValue(CLOSED_OFFSET);
  const backdropOpacity = useSharedValue(0);
  const slideX          = useSharedValue(0);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: sheetH.value || undefined,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const slideXStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  // Pan gesture for drag-handle dismiss
  const dragGesture = Gesture.Pan()
    .onStart(() => {
      cancelAnimation(translateY);
    })
    .onUpdate(e => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd(e => {
      if (e.translationY > 80 || e.velocityY > 500) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, CLOSE_SPRING);
      }
    });

  useEffect(() => {
    if (!active) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [active, onClose]);

  useEffect(() => {
    if (visible) {
      phaseRef.current = 'menu';
      setPhase('menu');
      slideX.value = 0;
      setActive(true);
      sheetH.value = measuredH.current.menu ?? 0;
      backdropOpacity.value = withTiming(1, { duration: duration.backdropIn, reduceMotion: ReduceMotion.System });
      translateY.value = withSpring(0, CLOSE_SPRING);
    } else {
      backdropOpacity.value = withTiming(0, { duration: duration.backdropOut, reduceMotion: ReduceMotion.System });
      translateY.value = withSpring(
        CLOSED_OFFSET,
        CLOSE_SPRING,
        (done) => { if (done) runOnJS(setActive)(false); },
      );
    }
  }, [visible]);

  function navigate(to: Phase, dir: 'push' | 'pop') {
    const exitDir  = dir === 'push' ? -SCREEN_WIDTH : SCREEN_WIDTH;
    const enterDir = dir === 'push' ?  SCREEN_WIDTH : -SCREEN_WIDTH;

    slideX.value = withTiming(exitDir, PUSH_TIMING, done => {
      if (!done) return;
      runOnJS(setPhase)(to);
      phaseRef.current = to;
      slideX.value = enterDir;
      slideX.value = withTiming(0, PUSH_TIMING);

      if (to === 'acknowledgements') {
        sheetH.value = withSpring(ACK_HEIGHT, CLOSE_SPRING);
      } else {
        const h = measuredH.current[to] ?? measuredH.current.menu;
        if (h) sheetH.value = withSpring(h, CLOSE_SPRING);
      }
    });
  }

  function onContentSizeChange(_: number, h: number) {
    const ph = phaseRef.current;
    if (h <= 0 || ph === 'acknowledgements') return;
    const prev = measuredH.current[ph];
    measuredH.current[ph] = h;
    if (prev !== h) {
      sheetH.value = sheetH.value > 0 ? withSpring(h, CLOSE_SPRING) : h;
    }
  }

  async function handleReview() {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        const url = await StoreReview.storeUrl();
        if (url) await Linking.openURL(url);
      }
    } catch {}
    onClose();
  }

  function handleLocationPermissions() {
    Linking.openSettings();
    onClose();
  }

  // ── Android: keep original layout ─────────────────────────────────────────

  if (Platform.OS !== 'ios') {
    return (
      <>
        <Animated.View
          style={[styles.backdrop, backdropStyle]}
          pointerEvents={active ? 'box-none' : 'none'}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.androidSheet, { maxHeight: ACK_HEIGHT }, sheetStyle]}
          pointerEvents={active ? 'auto' : 'none'}
          accessibilityViewIsModal={active}
        >
          {phase === 'acknowledgements' ? (
            <View style={[styles.androidAckLayout, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
              <PhaseHeader
                title={strings.menu_acknowledgements}
                onBack={() => navigate('menu', 'pop')}
                theme={theme}
              />
              <View style={[styles.androidCard, { flex: 1, overflow: 'hidden' }]}>
                <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                  {ACK_SECTIONS.flatMap(s => s.items).map((item, i, arr) => (
                    <View key={item.name}>
                      {i > 0 && <View style={styles.androidDivider} />}
                      <Pressable
                        style={styles.androidAckRow}
                        onPress={() => Linking.openURL(item.url)}
                        accessibilityRole="link"
                        accessibilityLabel={item.name}
                      >
                        <Text style={[styles.ackName, { fontFamily: fonts.regular, color: color.ink }]}>{item.name}</Text>
                        <MaterialIcons name="open-in-new" size={iconSize.sm} color={color.ink} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          ) : (
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={onContentSizeChange}
              contentContainerStyle={[
                styles.androidScrollContent,
                { paddingBottom: Math.max(insets.bottom, spacing.md) },
              ]}
            >
              {phase === 'menu' && (
                <>
                  <View style={styles.androidHeading}>
                    <Text style={[styles.headingTitle, { fontFamily: fonts.bold, color: color.ink }]}>
                      {strings.menu_settings}
                    </Text>
                    <Pressable
                      onPress={onClose}
                      style={styles.androidIconBtn}
                      hitSlop={spacing.xs}
                      accessibilityRole="button"
                      accessibilityLabel="Close menu"
                    >
                      <MaterialIcons name="close" size={iconSize.md} color={color.ink} />
                    </Pressable>
                  </View>
                  <View style={styles.androidCard}>
                    <MenuRow label={strings.menu_acknowledgements}     icon="menu-book"          onPress={() => navigate('acknowledgements', 'push')} theme={theme} />
                    <View style={styles.androidDivider} />
                    <MenuRow label={strings.menu_location_permissions} iconSymbol="location.fill" onPress={handleLocationPermissions} theme={theme} />
                    <View style={styles.androidDivider} />
                    <MenuRow label={strings.menu_support}              icon="favorite"            onPress={() => navigate('tip-jar', 'push')} theme={theme} />
                    <View style={styles.androidDivider} />
                    <MenuRow label={strings.menu_write_review}         icon="star"                onPress={handleReview} theme={theme} />
                  </View>
                </>
              )}
              {phase === 'tip-jar' && (
                <TipJarContent onBack={() => navigate('menu', 'pop')} theme={theme} />
              )}
            </ScrollView>
          )}
        </Animated.View>
      </>
    );
  }

  // ── iOS: new Liquid Glass design ──────────────────────────────────────────

  return (
    <>
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={active ? 'box-none' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, sheetStyle]}
        pointerEvents={active ? 'auto' : 'none'}
        accessibilityViewIsModal={active}
      >
        <BlurView
          tint={theme.blurTint}
          intensity={80}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.xl }]}
        />

        <GestureDetector gesture={dragGesture}>
          <View style={styles.dragHandleArea}>
            <View style={[styles.dragHandle, { backgroundColor: theme.dragHandle }]} />
          </View>
        </GestureDetector>

        {phase === 'acknowledgements' ? (
          <Animated.View style={[styles.ackLayout, slideXStyle, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <AckContent onBack={() => navigate('menu', 'pop')} theme={theme} />
          </Animated.View>
        ) : (
          <Animated.View style={[{ flex: 1 }, slideXStyle]}>
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={onContentSizeChange}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: Math.max(insets.bottom, spacing.md) },
              ]}
            >
              {phase === 'menu' && (
                <>
                  <View style={styles.heading}>
                    <Text style={[styles.headingTitle, { fontFamily: fonts.bold, color: theme.text }]}>
                      {strings.menu_settings}
                    </Text>
                    <CircleButton icon="close" onPress={onClose} label="Close menu" theme={theme} />
                  </View>

                  <View style={styles.rowGroup}>
                    <MenuRow label={strings.menu_acknowledgements}     icon="menu-book"          onPress={() => navigate('acknowledgements', 'push')} theme={theme} />
                    <MenuRow label={strings.menu_location_permissions} iconSymbol="location.fill" onPress={handleLocationPermissions} theme={theme} />
                    <MenuRow label={strings.menu_support}              icon="favorite"            onPress={() => navigate('tip-jar', 'push')} theme={theme} />
                    <MenuRow label={strings.menu_write_review}         icon="star"                onPress={handleReview} theme={theme} />
                  </View>

                  <Text style={[styles.footer, { color: theme.secondary }]}>{versionLabel}</Text>
                </>
              )}

              {phase === 'tip-jar' && (
                <TipJarContent onBack={() => navigate('menu', 'pop')} theme={theme} />
              )}
            </ScrollView>
          </Animated.View>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.scrim,
    zIndex: zIndex.backdrop,
  },

  // ── iOS sheet ──────────────────────────────────────────────────────────────
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    maxHeight: ACK_HEIGHT,
    zIndex: zIndex.sheet,
  },
  dragHandleArea: {
    paddingTop: spacing.sm,   // 12pt
    paddingBottom: spacing.xs,
    alignItems: 'center',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.sm,  // 12pt
    paddingTop: spacing.xs,
    gap: spacing.xl,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  headingTitle: {
    fontSize: fontSize.lg,   // 18pt
  },
  rowGroup: {
    gap: spacing.xs,         // 8pt between rows
  },
  rowCard: {
    borderRadius: radius.row,  // 16pt
    overflow: 'hidden',
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,  // 16pt
    paddingVertical: 14,            // 14pt per spec
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,    // 12pt icon→label
    flex: 1,
  },
  rowLabel: {
    fontSize: fontSize.base,  // 16pt
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  phaseTitle: {
    fontSize: fontSize.lg,  // 18pt
    flex: 1,
  },
  sectionHeader: {
    fontSize: fontSize.caption,   // 12pt
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xxs,
    paddingBottom: spacing.xxs,
  },
  ackSection: {
    gap: spacing.xxs,
  },
  ackCard: {
    borderRadius: radius.row,
    overflow: 'hidden',
  },
  ackScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  ackLayout: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    gap: spacing.xs,
  },
  ackName: {
    fontSize: fontSize.base,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.md,
  },
  tierEmoji: {
    fontSize: 20,
  },
  tierLabel: {
    fontSize: fontSize.base,   // 16pt Bold
  },
  tierDesc: {
    fontSize: fontSize.caption,  // 12pt Regular
  },
  tierPrice: {
    fontSize: fontSize.base,   // 16pt Black
  },
  tipSubtitle: {
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  tipThankYou: {
    fontSize: fontSize.xxl,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  tipUnavailable: {
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    fontSize: fontSize.caption,  // 12pt
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },

  // ── Android (original style, preserved) ───────────────────────────────────
  androidSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.surfaceSheet,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    zIndex: zIndex.sheet,
  },
  androidScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  androidAckLayout: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  androidHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  androidCard: {
    backgroundColor: color.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  androidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  androidDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.divider,
    marginVertical: spacing.md,
  },
  androidAckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  androidIconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: color.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
