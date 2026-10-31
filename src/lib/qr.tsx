import createQR from 'qrcode-generator';
import { useMemo } from 'react';
import { View } from 'react-native';

// Link do convite: abre a tela de entrar já com o código (no app instalado pelo build).
export function inviteLink(code: string) {
  return `jukebox://join?code=${code}`;
}

// Tira o código de convite de um QR code lido (link do convite ou só o código).
export function codeFromScan(data: string) {
  const match = data.match(/code=([A-Za-z0-9]{6})/) ?? data.trim().match(/^([A-Za-z0-9]{6})$/);
  return match ? match[1].toUpperCase() : null;
}

// QR code desenhado com Views (sem dependência nativa). Fundo sempre branco para a câmera ler.
export function QRCode({ value, size = 220 }: { value: string; size?: number }) {
  const rows = useMemo(() => {
    const qr = createQR(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
  }, [value]);
  const margin = 12;
  // Célula com tamanho inteiro para não aparecerem frestas entre os quadradinhos.
  const cell = Math.floor((size - margin * 2) / rows.length);

  return (
    <View style={{ padding: margin, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {row.map((dark, c) => (
            <View key={c} style={{ width: cell, height: cell, backgroundColor: dark ? '#000000' : '#FFFFFF' }} />
          ))}
        </View>
      ))}
    </View>
  );
}
