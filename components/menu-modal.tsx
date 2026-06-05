import type { ProductIOS } from 'expo-iap';
import { ACKNOWLEDGEMENTS } from '@/constants/acknowledgements';
import { TIP_PRODUCT_IDS } from '@/constants/iap';
import { strings } from '@/constants/strings';
import { color, duration, fontSize, fonts, iconSize, radius, size, spacing, zIndex } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as StoreReview from 'expo-store-review';
import { ComponentProps, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  LayoutAnimation,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let IAPModule: typeof import('expo-iap') | null = null;
try { IAPModule = require('expo-iap'); } catch {}

type Phase = 'menu' | 'acknowledgements' | 'tip-jar';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
}


const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ACK_HEIGHT    = SCREEN_HEIGHT - 85;
const CLOSED_OFFSET = SCREEN_HEIGHT;

// Figma spring spec — runs on UI thread, same on both platforms.
const SLIDE_SPRING = { stiffness: 130.6, damping: 17.14, mass: 1, reduceMotion: ReduceMotion.System };

const PHASE_LAYOUT_ANIM = {
  duration: duration.phaseAnim,
  create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
  update: { type: LayoutAnimation.Types.spring, springDamping: 0.75 },
  delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Divider() {
  return <View style={styles.divider} />;
}

function PhaseHeader({ title, onBack, onClose }: {
  title: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.phaseHeader}>
      <Pressable
        onPress={onBack}
        style={styles.iconButton}
        hitSlop={spacing.xs}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <MaterialIcons name="chevron-left" size={iconSize.md} color={color.ink} />
      </Pressable>
      <Text style={[styles.phaseTitle, { fontFamily: fonts.medium }]}>{title}</Text>
      <Pressable
        onPress={onClose}
        style={styles.iconButton}
        hitSlop={spacing.xs}
        accessibilityRole="button"
        accessibilityLabel="Close menu"
      >
        <MaterialIcons name="check" size={iconSize.md} color={color.ink} />
      </Pressable>
    </View>
  );
}

function MenuRow({ label, onPress, icon, iconSymbol }: {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof MaterialIcons>['name'];
  iconSymbol?: ComponentProps<typeof IconSymbol>['name'];
}) {
  return (
    <Pressable
      style={styles.menuRow}
      onPress={onPress}
      hitSlop={spacing.xxs}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.menuRowLeft}>
        {iconSymbol
          ? <IconSymbol name={iconSymbol} size={iconSize.lg} color={color.ink} />
          : <MaterialIcons name={icon!} size={iconSize.lg} color={color.ink} />
        }
        <Text style={[styles.menuRowLabel, { fontFamily: fonts.regular }]}>{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={iconSize.lg} color={color.ink} />
    </Pressable>
  );
}

function TipJarContent({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
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

    // Finish any transactions that completed (including leftovers from prior sessions)
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
      <PhaseHeader title={strings.menu_support} onBack={onBack} onClose={onClose} />
      <View style={[styles.card, styles.tipCard]}>
        {thankYou ? (
          <Text style={[styles.tipThankYou, { fontFamily: fonts.regular }]}>{strings.tip_thank_you}</Text>
        ) : (
          <>
            <Text style={[styles.phaseSubtitle, { fontFamily: fonts.regular }]}>{strings.tip_subtitle}</Text>
            {loading ? (
              <ActivityIndicator style={{ marginTop: spacing.md }} />
            ) : products.length === 0 ? (
              <Text style={[styles.tipUnavailable, { fontFamily: fonts.regular }]}>{strings.tip_unavailable}</Text>
            ) : (
              products.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.tipButton}
                  onPress={() => purchase(p.id)}
                  accessibilityRole="button"
                  accessibilityLabel={p.displayPrice ?? p.id}
                >
                  <Text style={[styles.tipButtonText, { fontFamily: fonts.semibold }]}>
                    {p.displayPrice ?? p.id}
                  </Text>
                </Pressable>
              ))
            )}
          </>
        )}
      </View>
    </>
  );
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export function MenuModal({ visible, onClose }: MenuModalProps) {
  const insets       = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [phase,  setPhase]  = useState<Phase>('menu');
  const [active, setActive] = useState(false);

  const sheetH = useSharedValue(0);

  const phaseRef  = useRef<Phase>('menu');
  const measuredH = useRef<Partial<Record<Phase, number>>>({});

  const translateY      = useSharedValue(CLOSED_OFFSET);
  const backdropOpacity = useSharedValue(0);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    height: sheetH.value || undefined,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

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
      setActive(true);
      sheetH.value = measuredH.current.menu ?? 0;
      backdropOpacity.value = withTiming(1, { duration: duration.backdropIn, reduceMotion: ReduceMotion.System });
      translateY.value = withSpring(0, SLIDE_SPRING);
    } else {
      backdropOpacity.value = withTiming(0, { duration: duration.backdropOut, reduceMotion: ReduceMotion.System });
      translateY.value = withSpring(
        CLOSED_OFFSET,
        SLIDE_SPRING,
        (done) => { if (done) runOnJS(setActive)(false); },
      );
    }
  }, [visible]);

  function navigate(to: Phase) {
    phaseRef.current = to;
    if (!reduceMotion) LayoutAnimation.configureNext(PHASE_LAYOUT_ANIM);
    setPhase(to);
    if (to === 'acknowledgements') {
      sheetH.value = withSpring(ACK_HEIGHT, SLIDE_SPRING);
    } else {
      const h = measuredH.current[to] ?? measuredH.current.menu;
      if (h) sheetH.value = withSpring(h, SLIDE_SPRING);
    }
  }

  function onContentSizeChange(_: number, h: number) {
    const ph = phaseRef.current;
    if (h <= 0 || ph === 'acknowledgements') return;
    const prev = measuredH.current[ph];
    measuredH.current[ph] = h;
    if (prev !== h) {
      sheetH.value = sheetH.value > 0 ? withSpring(h, SLIDE_SPRING) : h;
    }
  }

  async function handleReview() {
    try {
      const url = await StoreReview.storeUrl();
      if (url) await Linking.openURL(url);
    } catch {}
    onClose();
  }

  function handleLocationPermissions() {
    Linking.openSettings();
    onClose();
  }

  return (
    <>
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        pointerEvents={active ? 'box-none' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { maxHeight: ACK_HEIGHT }, sheetStyle]}
        pointerEvents={active ? 'auto' : 'none'}
        accessibilityViewIsModal={active}
      >
        {phase === 'acknowledgements' ? (
          <View style={[styles.ackLayout, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <PhaseHeader
              title={strings.menu_acknowledgements}
              onBack={() => navigate('menu')}
              onClose={onClose}
            />
            <View style={[styles.card, styles.ackCard]}>
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {ACKNOWLEDGEMENTS.map((lib, i) => (
                  <View key={lib.name}>
                    {i > 0 && <Divider />}
                    <Pressable
                      style={styles.ackRow}
                      onPress={() => Linking.openURL(lib.url)}
                      accessibilityRole="link"
                      accessibilityLabel={lib.name}
                    >
                      <Text style={[styles.ackName, { fontFamily: fonts.regular }]}>{lib.name}</Text>
                      <MaterialIcons name="open-in-new" size={iconSize.sm} color={color.ink} />
                    </Pressable>
                  </View>
                ))}
                <Text style={[styles.dataSource, { fontFamily: fonts.regular }]}>
                  {strings.ack_data_source}
                </Text>
              </ScrollView>
            </View>
          </View>
        ) : (
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
                  <Text style={[styles.headingTitle, { fontFamily: fonts.bold }]}>{strings.menu_settings}</Text>
                  <Pressable
                    onPress={onClose}
                    style={styles.iconButton}
                    hitSlop={spacing.xs}
                    accessibilityRole="button"
                    accessibilityLabel="Close menu"
                  >
                    <MaterialIcons name="check" size={iconSize.md} color={color.ink} />
                  </Pressable>
                </View>
                <View style={styles.card}>
                  <MenuRow label={strings.menu_acknowledgements}     icon="menu-book"          onPress={() => navigate('acknowledgements')} />
                  <Divider />
                  <MenuRow label={strings.menu_location_permissions} iconSymbol="location.fill" onPress={handleLocationPermissions} />
                  <Divider />
                  <MenuRow label={strings.menu_support}              icon="favorite"            onPress={() => navigate('tip-jar')} />
                  <Divider />
                  <MenuRow label={strings.menu_write_review}         icon="star"                onPress={handleReview} />
                </View>
              </>
            )}
            {phase === 'tip-jar' && (
              <TipJarContent onBack={() => navigate('menu')} onClose={onClose} />
            )}
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: color.scrim,
    zIndex: zIndex.backdrop,
  },
  sheet: {
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
  ackLayout: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  ackCard: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headingTitle: {
    flex: 1,
    fontSize: fontSize.xxxl,
    color: color.black,
  },
  card: {
    backgroundColor: color.surfaceCard,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuRowLabel: {
    fontSize: fontSize.base,
    color: color.black,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.divider,
    marginVertical: spacing.md,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: size.iconBtn,
    height: size.iconBtn,
    borderRadius: radius.md,
    backgroundColor: color.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    color: color.black,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  phaseSubtitle: {
    fontSize: fontSize.sm,
    color: color.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  ackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  ackName: {
    fontSize: fontSize.base,
    color: color.black,
  },
  dataSource: {
    fontSize: fontSize.xs,
    color: color.textFaint,
    textAlign: 'center',
    paddingTop: spacing.md,
  },
  tipCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 100,
  },
  tipButton: {
    backgroundColor: color.brand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.sm,
    width: size.tipBtnWidth,
    alignItems: 'center',
  },
  tipButtonText: {
    color: color.white,
    fontSize: fontSize.base,
  },
  tipThankYou: {
    fontSize: fontSize.xxl,
    color: color.textSuccess,
    textAlign: 'center',
  },
  tipUnavailable: {
    fontSize: fontSize.md,
    color: color.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
