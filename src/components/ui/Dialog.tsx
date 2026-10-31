import { useEffect, useState } from 'react';
import { Modal, Pressable, Text } from 'react-native';

import { useTheme } from '@/lib/theme';

import { Button } from './Button';

export type DialogButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
type Dialog = { title: string; message?: string; buttons: DialogButton[] };

let openDialog: ((dialog: Dialog) => void) | null = null;

// Substitui o Alert do React Native, que não aparece no navegador. Mesma assinatura do Alert.alert.
export function showDialog(title: string, message?: string, buttons: DialogButton[] = [{ text: 'OK' }]) {
  openDialog?.({ title, message, buttons });
}

// Montado uma vez na raiz do app; exibe os diálogos pedidos por showDialog.
export function DialogHost() {
  const { styles } = useTheme();
  const [dialog, setDialog] = useState<Dialog | null>(null);

  useEffect(() => {
    openDialog = setDialog;
    return () => {
      openDialog = null;
    };
  }, []);

  if (!dialog) return null;

  // Fecha antes de rodar a ação, para a ação poder abrir outro diálogo.
  function press(button?: DialogButton) {
    setDialog(null);
    button?.onPress?.();
  }
  const cancel = dialog.buttons.find((b) => b.style === 'cancel');
  const actions = dialog.buttons.filter((b) => b.style !== 'cancel');

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => press(cancel)}>
      <Pressable
        onPress={() => press(cancel)}
        style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        {/* Pressable vazio para que tocar dentro da caixa não feche o diálogo. */}
        <Pressable onPress={() => {}} style={[styles.card, { width: '100%', maxWidth: 400, alignSelf: 'center' }]}>
          <Text style={styles.subtitle}>{dialog.title}</Text>
          {!!dialog.message && <Text style={styles.muted}>{dialog.message}</Text>}
          {actions.map((b) => (
            <Button
              key={b.text}
              title={b.text}
              variant={b.style === 'destructive' ? 'danger' : 'primary'}
              onPress={() => press(b)}
            />
          ))}
          {cancel && <Button title={cancel.text} variant="secondary" onPress={() => press(cancel)} />}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
