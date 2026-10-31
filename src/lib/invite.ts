// Link do convite: abre a tela de entrar já com o código (no app instalado pelo build).
export function inviteLink(code: string) {
  return `jukebox://join?code=${code}`;
}

// Tira o código de convite de um QR code lido (link do convite ou só o código).
export function codeFromScan(data: string) {
  const match = data.match(/code=([A-Za-z0-9]{6})/) ?? data.trim().match(/^([A-Za-z0-9]{6})$/);
  return match ? match[1].toUpperCase() : null;
}
