import type { ProductIOS } from 'expo-iap';
import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { TIP_PRODUCT_IDS } from '@/constants/iap';
import { strings } from '@/constants/strings';
import { color, fontSize, fonts, radius, size, spacing } from '@/constants/theme';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';

let IAPModule: typeof import('expo-iap') | null = null;
try { IAPModule = require('expo-iap'); } catch {}

export default function TipJarScreen() {
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
    <AdaptiveGlass style={styles.container}>
      <Stack.Screen
        options={{
          title: strings.menu_support,
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {thankYou ? (
          <Text style={[styles.thankYou, { fontFamily: fonts.regular }]}>{strings.tip_thank_you}</Text>
        ) : (
          <>
            <Text style={[styles.subtitle, { fontFamily: fonts.regular }]}>{strings.tip_subtitle}</Text>
            {loading ? (
              <ActivityIndicator style={{ marginTop: spacing.md }} />
            ) : products.length === 0 ? (
              <Text style={[styles.unavailable, { fontFamily: fonts.regular }]}>{strings.tip_unavailable}</Text>
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
      </ScrollView>
    </AdaptiveGlass>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    minHeight: 200,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: color.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  thankYou: {
    fontSize: fontSize.xxl,
    color: color.textSuccess,
    textAlign: 'center',
  },
  unavailable: {
    fontSize: fontSize.md,
    color: color.textFaint,
    textAlign: 'center',
    marginTop: spacing.md,
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
});
