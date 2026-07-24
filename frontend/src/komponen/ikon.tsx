// Kumpulan ikon SVG inline sederhana untuk sidebar/header. Sengaja tidak memakai library ikon
// eksternal agar fondasi frontend tetap ringan tanpa dependency tambahan di tahap ini.
export type PropsIkon = React.SVGProps<SVGSVGElement>;

function BungkusIkon({ children, ...props }: React.PropsWithChildren<PropsIkon>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IkonDashboard(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </BungkusIkon>
  );
}

export function IkonInventaris(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" />
      <path d="M3 7.5V16l9 4.5 9-4.5V7.5" />
      <path d="M12 12v8.5" />
    </BungkusIkon>
  );
}

export function IkonKategori(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M11 3h-.5a2 2 0 0 0-1.6.8L3.8 10.9a2 2 0 0 0 0 2.4l6.9 8.7a2 2 0 0 0 2.8.3l6.9-5.5a2 2 0 0 0 .3-2.8L14 3.8A2 2 0 0 0 11 3Z" />
      <circle cx="9" cy="9" r="1.5" />
    </BungkusIkon>
  );
}

export function IkonUser(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20.5c1.4-3.6 4.3-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
    </BungkusIkon>
  );
}

export function IkonAktivitas(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </BungkusIkon>
  );
}

export function IkonProfil(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.5 19a6 6 0 0 1 11 0" />
    </BungkusIkon>
  );
}

export function IkonMenuHamburger(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </BungkusIkon>
  );
}

export function IkonKeluar(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </BungkusIkon>
  );
}

export function IkonPanelCiutkan(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M14 10l-2 2 2 2" />
    </BungkusIkon>
  );
}

export function IkonPanelPerluas(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M12 10l2 2-2 2" />
    </BungkusIkon>
  );
}

export function IkonMata(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </BungkusIkon>
  );
}

export function IkonMataCoret(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7A10.8 10.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.2 4" />
      <path d="M6.4 6.6C4 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.3 0 2.5-.3 3.6-.8" />
      <path d="M9.9 10a2.8 2.8 0 0 0 3.9 3.9" />
    </BungkusIkon>
  );
}

export function IkonCari(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </BungkusIkon>
  );
}

export function IkonTambah(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M12 5v14M5 12h14" />
    </BungkusIkon>
  );
}

export function IkonEdit(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </BungkusIkon>
  );
}

export function IkonHapus(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </BungkusIkon>
  );
}

export function IkonTutup(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </BungkusIkon>
  );
}

export function IkonUnggah(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M12 4v12" />
    </BungkusIkon>
  );
}

export function IkonReset(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </BungkusIkon>
  );
}

export function IkonChevronKiri(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="m15 18-6-6 6-6" />
    </BungkusIkon>
  );
}

export function IkonChevronKanan(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="m9 18 6-6-6-6" />
    </BungkusIkon>
  );
}

export function IkonGambar(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="m21 15-5-5L5 21" />
    </BungkusIkon>
  );
}

export function IkonKotakStat(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M21 8V7l-9-4-9 4v1l9 4 9-4Z" />
      <path d="M3 8v9l9 4 9-4V8" />
      <path d="M12 12v9" />
    </BungkusIkon>
  );
}

export function IkonCentang(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 5-5" />
    </BungkusIkon>
  );
}

export function IkonPeringatan(props: PropsIkon) {
  return (
    <BungkusIkon {...props}>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17.5v.5" />
    </BungkusIkon>
  );
}
