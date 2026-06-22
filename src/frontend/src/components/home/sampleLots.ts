import { LuxuryLot } from "./types";

const WATCH_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuANdqKPl56gFtN5wAeZz0XhHftC5rwSX_G1hB3LouYzJsFUbLmMdEdI42L1QXoiA4BPVgcOLEOlLikc3-UvuU5xqHLmsLpcLLsO3AIM2Y-I6qzA6L2u-JMSrojMwvmF95mtIh5cB09y7-yfQMk_bBA5wDwE4R7l_VwH5MwRAYEI7yUyz3mG1BiAuGiaHBSEFgj7ZUeeNhromQ3jROgNDKnYUEyrP0UL9A4R8KrufKsxK_RNCE1eMdpXdup8biX87SClJiqGk5a4xLTT";
const ART_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuB_D1a27UndMYzpeK1DXDFFxP-4izgqbZ3SbZHTu6RHfl37zV8ws5mlRSUO0Clp16UyFGkDv-NFg-Zroiii-Kw_ViBmVEiD1Ro9qOg0UbZk5GSf4qfnOGMB72kCude986W19MD4Ok_BJNykvlr-QgGQ92rYfrBfMMZNGX34p0sDcc4yLxk0odeBufJIIkCeMBBkeTe-vp_vhUk05fk_wgzNOmu6sAEcg3SvR-rMpCiIWm052DyEw04N1pEjnFbkmxQga_Lzyx_L-UVc";
const DESIGN_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDiT6gUkAiEERIx4SsHiJD_-EqZYjRVfIb7Ww2eTZwJLXaLJcvgzE_73wUmxloSiLQ7heBbWWpnQUBeXJdDE_SSmiNWQ3SRVFV_lMU-QBz-JDYKe5DVpN7_n1JluxjNfBmADpcMWLz5NSi5gtqVVT_vLyZKswfO4VxoIBz_MmoL_enH3iE2srXTF3DaiosPsRxeA0SZKOAKqmkVXebwiwg-wMzSA4dtUFWr1HNeVRvucRwAcX1QFz0HIHO0RFrwr5ZbXrP79Q3QZass";
const CLASSIC_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0Zs9QPyF2rkU6JjnmjIlk4-Z5H1zxXNUZygFt-j0A0hGLM71G0g8mNSief6Mr_64bsBLPfQy26IiQclTst8XDVnogBLwXJT4xNqlnuEPTLzATqrf1paPI6ZBACFrvgomIxwdHLqv8jOzyrSqehLiiGqNa-m2z9utaDdSULQsrMBe3LHH44J4BaIdx37fsQ026lBeorQ0HQFmzsZsThQiiN4wW2qdYj_HaNAvsOSMnkng1v3AqlfiJqS9psd_4LpnVvKD27Tlp5Z2";

export const sampleLots: LuxuryLot[] = [
  { id: 1, lotNumber: "042", title: "1968 Rolex Cosmograph Daytona ‘Paul Newman’", category: "Watches", image: WATCH_IMAGE, currentBid: 185000, estimateLow: 210000, estimateHigh: 260000, timeLeft: "01h 22m", bids: 38, status: "live", verified: true },
  { id: 2, lotNumber: "017", title: "Continuum — Patinated Bronze Sculpture", category: "Fine Art", image: ART_IMAGE, currentBid: 42500, estimateLow: 50000, estimateHigh: 68000, timeLeft: "03h 45m", bids: 21, status: "live", verified: true },
  { id: 3, lotNumber: "029", title: "Patek Philippe Nautilus 5711/1A", category: "Watches", image: WATCH_IMAGE, currentBid: 125000, estimateLow: 140000, estimateHigh: 175000, timeLeft: "00h 58m", bids: 46, status: "live", verified: true },
  { id: 4, lotNumber: "038", title: "European Impressionist Landscape in Oil", category: "Art", image: ART_IMAGE, currentBid: 89000, estimateLow: 95000, estimateHigh: 120000, timeLeft: "02h 15m", bids: 17, status: "live", verified: true },
  { id: 5, lotNumber: "064", title: "Eames Lounge Chair & Ottoman, First Series", category: "Design", image: DESIGN_IMAGE, currentBid: 18400, estimateLow: 22000, estimateHigh: 28000, timeLeft: "05h 09m", bids: 14, status: "live", verified: true },
  { id: 6, lotNumber: "081", title: "1963 Ferrari 250 GTE Series II", category: "Cars", image: CLASSIC_IMAGE, currentBid: 680000, estimateLow: 720000, estimateHigh: 850000, timeLeft: "07h 31m", bids: 29, status: "live", verified: true },
];
