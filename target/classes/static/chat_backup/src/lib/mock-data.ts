export const mockUser = {
  name: "Alexander Sterling",
  email: "a.sterling@luxecollect.com",
  phone: "+1 (212) 555-0182",
  role: "Premium Member",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXE08jGkP0wNgxSrwHFZWZydXCEr9H3OPgDOTX3xLWjx71FcefCaM2oJQdiurNQR880o3M6HLg9n6Qt9QrgZl7vob-UtSMWZ-teOAwp0z6VJHeCy8UaGY6A3YnnQHrYlXDN_f7pPDTlNd8vO3fV_KqdmBR9GeE7YyGyYiPvV2n2QHwPML0aJMCikX_a34dz8VK0qaN5NVGLEBahKQqtgsLI35fDKD34AYJOB7wLZvtKxu6WlowY-IxHQOrXKrDuBUoTBefE8QRC8At",
  walletBalance: 5240,
  lockedDeposits: 18500,
};

export const mockActiveBids = [
  {
    id: 1,
    lotNumber: "42",
    title: "1969 Vintage Chrono",
    currentBid: 45000,
    timeLeft: "02:15:30",
    status: "leading" as const,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0T0PZgPUEueuBE1vGUu7j9ZgQvOf6lqYa6iIdxTgzdhwzglB9w3avoRSXXvgRTn1Gpv8ItJWP--UbnfgGMVvFzrIHdHhPrFWALQijZiz7ALLzLmEb8Ct-5T0VHgHg2t0ZJjeKuSHoO7h-6Rso9PmmwCUWk0zrJA2ckkVyQbCFZmSXUXbzHljUA5IxvN72_r12Ovb30YTnUk8PgVWEBLmpm-yigTHZGa78OJq74_2OaMRRmdFU2-LR4EzpzFzLhH7qLbhAKNiFXyTu",
  },
  {
    id: 2,
    lotNumber: "18",
    title: "Abstract Canvas",
    currentBid: 120000,
    timeLeft: "00:05:12",
    status: "outbid" as const,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOU4XCvxLcnZj9K4EkObtvjG3NKQrMY2VBP7EKBW9qNKcL4QKn6jNsDDx9WoBh7Ud8PfxiUY_ItNu_FGCevP0dYYKub-eW8o93LJuZrACGGF5FtkX0_z7RmBfyni4RsHl0LKYxgmXCUKFAKZdXh8WFP16yq6OmidZEK_Sg1TI4uUi78SaAJTQrYdfXt6MS-AIdYBDZywb9RE2TfPxkXmi7MOvPcwK5x8cFhKOSKgaYS8MDCtEom9sCydlcjYxSWOUi1zuxbcJmdfxd",
  },
];

export const mockWonItems = [
  { id: 1, date: "Oct 24, 2023", lotNumber: "05", title: "Bronze Figure", winningBid: 34000, status: "paid" as const, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0Zs9QPyF2rkU6JjnmjIlk4-Z5H1zxXNUZygFt-j0A0hGLM71G0g8mNSief6Mr_64bsBLPfQy26IiQclTst8XDVnogBLwXJT4xNqlnuEPTLzATqrf1paPI6ZBACFrvgomIxwdHLqv8jOzyrSqehLiiGqNa-m2z9utaDdSULQsrMBe3LHH44J4BaIdx37fsQ026lBeorQ0HQFmzsZsThQiiN4wW2qdYj_HaNAvsOSMnkng1v3AqlfiJqS9psd_4LpnVvKD27Tlp5Z2" },
  { id: 2, date: "Oct 20, 2023", lotNumber: "88", title: "Eames Lounge", winningBid: 8500, status: "pending" as const, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiT6gUkAiEERIx4SsHiJD_-EqZYjRVfIb7Ww2eTZwJLXaLJcvgzE_73wUmxloSiLQ7heBbWWpnQUBeXJdDE_SSmiNWQ3SRVFV_lMU-QBz-JDYKe5DVpN7_n1JluxjNfBmADpcMWLz5NSi5gtqVVT_vLyZKswfO4VxoIBz_MmoL_enH3iE2srXTF3DaiosPsRxeA0SZKOAKqmkVXebwiwg-wMzSA4dtUFWr1HNeVRvucRwAcX1QFz0HIHO0RFrwr5ZbXrP79Q3QZass" },
  { id: 3, date: "Sep 15, 2023", lotNumber: "42", title: "1969 Vintage Chrono", winningBid: 45000, status: "paid" as const, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0T0PZgPUEueuBE1vGUu7j9ZgQvOf6lqYa6iIdxTgzdhwzglB9w3avoRSXXvgRTn1Gpv8ItJWP--UbnfgGMVvFzrIHdHhPrFWALQijZiz7ALLzLmEb8Ct-5T0VHgHg2t0ZJjeKuSHoO7h-6Rso9PmmwCUWk0zrJA2ckkVyQbCFZmSXUXbzHljUA5IxvN72_r12Ovb30YTnUk8PgVWEBLmpm-yigTHZGa78OJq74_2OaMRRmdFU2-LR4EzpzFzLhH7qLbhAKNiFXyTu" },
];

export const mockWatchlist = [
  { id: 1, lotNumber: "77", title: "Patek Philippe Grand Complication", currentBid: 280000, timeLeft: "1d 4h", category: "Watches", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuANdqKPl56gFtN5wAeZz0XhHftC5rwSX_G1hB3LouYzJsFUbLmMdEdI42L1QXoiA4BPVgcOLEOlLikc3-UvuU5xqHLmsLpcLLsO3AIM2Y-I6qzA6L2u-JMSrojMwvmF95mtIh5cB09y7-yfQMk_bBA5wDwE4R7l_VwH5MwRAYEI7yUyz3mG1BiAuGiaHBSEFgj7ZUeeNhromQ3jROgNDKnYUEyrP0UL9A4R8KrufKsxK_RNCE1eMdpXdup8biX87SClJiqGk5a4xLTT" },
  { id: 2, lotNumber: "12", title: "Abstract Expressionist Triptych", currentBid: 95000, timeLeft: "2d 8h", category: "Fine Art", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_D1a27UndMYzpeK1DXDFFxP-4izgqbZ3SbZHTu6RHfl37zV8ws5mlRSUO0Clp16UyFGkDv-NFg-Zroiii-Kw_ViBmVEiD1Ro9qOg0UbZk5GSf4qfnOGMB72kCude986W19MD4Ok_BJNykvlr-QgGQ92rYfrBfMMZNGX34p0sDcc4yLxk0odeBufJIIkCeMBBkeTe-vp_vhUk05fk_wgzNOmu6sAEcg3SvR-rMpCiIWm052DyEw04N1pEjnFbkmxQga_Lzyx_L-UVc" },
  { id: 3, lotNumber: "55", title: "Ferrari 250 GTE 1963", currentBid: 680000, timeLeft: "3d 2h", category: "Automotive", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBE0Zs9QPyF2rkU6JjnmjIlk4-Z5H1zxXNUZygFt-j0A0hGLM71G0g8mNSief6Mr_64bsBLPfQy26IiQclTst8XDVnogBLwXJT4xNqlnuEPTLzATqrf1paPI6ZBACFrvgomIxwdHLqv8jOzyrSqehLiiGqNa-m2z9utaDdSULQsrMBe3LHH44J4BaIdx37fsQ026lBeorQ0HQFmzsZsThQiiN4wW2qdYj_HaNAvsOSMnkng1v3AqlfiJqS9psd_4LpnVvKD27Tlp5Z2" },
  { id: 4, lotNumber: "31", title: "Royal Doulton Flambe Vase, 1920", currentBid: 12400, timeLeft: "5h 22m", category: "Ceramics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiT6gUkAiEERIx4SsHiJD_-EqZYjRVfIb7Ww2eTZwJLXaLJcvgzE_73wUmxloSiLQ7heBbWWpnQUBeXJdDE_SSmiNWQ3SRVFV_lMU-QBz-JDYKe5DVpN7_n1JluxjNfBmADpcMWLz5NSi5gtqVVT_vLyZKswfO4VxoIBz_MmoL_enH3iE2srXTF3DaiosPsRxeA0SZKOAKqmkVXebwiwg-wMzSA4dtUFWr1HNeVRvucRwAcX1QFz0HIHO0RFrwr5ZbXrP79Q3QZass" },
];

export const mockTransactions = [
  { id: 1, date: "Oct 28, 2023", type: "Deposit", description: "Bank Transfer", amount: 50000, status: "completed" as const },
  { id: 2, date: "Oct 27, 2023", type: "Bid Lock", description: "Lot #42 Deposit", amount: -18500, status: "locked" as const },
  { id: 3, date: "Oct 25, 2023", type: "Withdrawal", description: "Wire Transfer to JPMorgan", amount: -10000, status: "completed" as const },
  { id: 4, date: "Oct 22, 2023", type: "Refund", description: "Lot #19 Bid Released", amount: 5000, status: "completed" as const },
];

export const mockInventory = [
  { id: 1, title: "1964 Rolex Daytona", category: "Watches", startingBid: 180000, status: "live" as const, views: 1240, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0T0PZgPUEueuBE1vGUu7j9ZgQvOf6lqYa6iIdxTgzdhwzglB9w3avoRSXXvgRTn1Gpv8ItJWP--UbnfgGMVvFzrIHdHhPrFWALQijZiz7ALLzLmEb8Ct-5T0VHgHg2t0ZJjeKuSHoO7h-6Rso9PmmwCUWk0zrJA2ckkVyQbCFZmSXUXbzHljUA5IxvN72_r12Ovb30YTnUk8PgVWEBLmpm-yigTHZGa78OJq74_2OaMRRmdFU2-LR4EzpzFzLhH7qLbhAKNiFXyTu" },
  { id: 2, title: "Andy Warhol Silkscreen Print", category: "Fine Art", startingBid: 55000, status: "pending" as const, views: 430, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOU4XCvxLcnZj9K4EkObtvjG3NKQrMY2VBP7EKBW9qNKcL4QKn6jNsDDx9WoBh7Ud8PfxiUY_ItNu_FGCevP0dYYKub-eW8o93LJuZrACGGF5FtkX0_z7RmBfyni4RsHl0LKYxgmXCUKFAKZdXh8WFP16yq6OmidZEK_Sg1TI4uUi78SaAJTQrYdfXt6MS-AIdYBDZywb9RE2TfPxkXmi7MOvPcwK5x8cFhKOSKgaYS8MDCtEom9sCydlcjYxSWOUi1zuxbcJmdfxd" },
  { id: 3, title: "Mid-Century Eames Lounge Chair", category: "Furniture", startingBid: 8500, status: "review" as const, views: 88, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiT6gUkAiEERIx4SsHiJD_-EqZYjRVfIb7Ww2eTZwJLXaLJcvgzE_73wUmxloSiLQ7heBbWWpnQUBeXJdDE_SSmiNWQ3SRVFV_lMU-QBz-JDYKe5DVpN7_n1JluxjNfBmADpcMWLz5NSi5gtqVVT_vLyZKswfO4VxoIBz_MmoL_enH3iE2srXTF3DaiosPsRxeA0SZKOAKqmkVXebwiwg-wMzSA4dtUFWr1HNeVRvucRwAcX1QFz0HIHO0RFrwr5ZbXrP79Q3QZass" },
];

export const mockPayouts = [
  { id: 1, date: "Oct 25, 2023", ref: "#PO-88219", amount: 450000, destination: "JPMorgan ****4582", status: "processed" as const },
  { id: 2, date: "Oct 12, 2023", ref: "#PO-87102", amount: 1200000, destination: "JPMorgan ****4582", status: "processed" as const },
  { id: 3, date: "Nov 02, 2023", ref: "#PO-89001", amount: 200000, destination: "JPMorgan ****4582", status: "processing" as const },
];

export const mockAdminStats = {
  totalRevenue: "$12,842,000",
  completedTransactions: "1,240",
  activeUsers: "8,420",
  commissionEarned: "$1,215,600",
  revenueGrowth: "+14%",
  transactionsGrowth: "+8%",
  usersGrowth: "+5%",
  commissionGrowth: "+12%",
};

export const mockAuctionHistory = [
  { id: 1, lotNumber: "42", title: "1968 Rolex Cosmograph Daytona", seller: "J. Harrington", buyer: "A. Sterling", salePrice: 185000, date: "Oct 28, 2023", status: "completed" as const },
  { id: 2, lotNumber: "18", title: "Abstract Expressionist Canvas", seller: "M. Chen", buyer: "P. Dubois", salePrice: 120000, date: "Oct 27, 2023", status: "completed" as const },
  { id: 3, lotNumber: "05", title: "Bronze Sculpture - Continuum", seller: "V. Petrov", buyer: "A. Sterling", salePrice: 34000, date: "Oct 24, 2023", status: "completed" as const },
  { id: 4, lotNumber: "33", title: "Patek Philippe Nautilus", seller: "E. Nakamura", buyer: "C. Laurent", salePrice: 95000, date: "Oct 20, 2023", status: "dispute" as const },
];

export const mockCategories = [
  { id: 1, name: "Watches", icon: "watch", count: 142, subcategories: ["Luxury", "Vintage", "Sports"] },
  { id: 2, name: "Fine Art", icon: "palette", count: 89, subcategories: ["Paintings", "Sculptures", "Prints"] },
  { id: 3, name: "Jewelry", icon: "diamond", count: 215, subcategories: ["Rings", "Necklaces", "Bracelets"] },
  { id: 4, name: "Automotive", icon: "directions_car", count: 28, subcategories: ["Classic Cars", "Sports Cars", "Motorcycles"] },
];

export const mockStaffApprovals = [
  { id: 1, title: "1964 Rolex Daytona 'Big Red'", seller: "James Harrington", category: "Watches", submitted: "Oct 28, 2023", estimatedValue: "$180,000", status: "pending" as const },
  { id: 2, title: "Warhol Marilyn Print (1967)", seller: "Maria Chen", category: "Fine Art", submitted: "Oct 27, 2023", estimatedValue: "$55,000", status: "pending" as const },
  { id: 3, title: "1963 Ferrari 250 GTE", seller: "Viktor Petrov", category: "Automotive", submitted: "Oct 25, 2023", estimatedValue: "$680,000", status: "review" as const },
];

export const mockMessages = [
  { id: 1, sender: "Auction Specialist", avatar: "support_agent", preview: "Congratulations on your winning bid for Lot #05!", time: "Oct 24", unread: false, isStaff: true },
  { id: 2, sender: "Support Liaison", avatar: "headset_mic", preview: "Your KYC documents have been approved.", time: "Oct 22", unread: true, isStaff: true },
  { id: 3, sender: "Admin Notice", avatar: "campaign", preview: "The Heritage Collection auction begins Nov 1.", time: "Oct 20", unread: true, isStaff: true },
];

export const mockLiveAuction = {
  lotNumber: "42",
  collection: "Heritage Collection",
  title: "1968 Rolex Cosmograph Daytona",
  timeRemaining: "01:45:00",
  currentBid: 185000,
  reserveMet: true,
  depositRequired: 18500,
  depositPercent: 10,
  isLive: true,
  recentBids: [
    { bidder: "Bidder 8942", amount: 185000, time: "2m ago" },
    { bidder: "Bidder 4120", amount: 175000, time: "5m ago" },
    { bidder: "Bidder 8942", amount: 160000, time: "12m ago" },
  ],
  images: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAdC5M7Wq-fFl3OAXjc4Fc6HKkKGNzi0r9nECSEgLnxNkhE8XY18eFfdyxmR7ElCa-zWLQxXQobRRfNDEqacZ6ewvKB-ZIcb61BiEFXzsZYiFOgFmeyc6_SLUNzUZQFyQg97iRcvAr19pIoC4p1rTZdZpzptsHgEEUarO1KpzYLmRyo8JTaJvUjUnraR3WWaMCGt-ScXc78nnwm9KPcqAcnqeVWWw09-UYYTMnSQNI2d4TAkCHY081-VvF0RAeBDyTC_q2j1UiWNG9C",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCDyukz5oPcg-HN0mfnpZ_bBzUGjGx5lECK_8DhxWsNAE7yZaERLAc9o_hPdwjMrd95vXiaLEbzzSSoyBLWj2S0dPFrtkoTc42Q9njowWc8C_NAP1H5aWyixIrWtxzOWn0h7Oe81d9sxMvuI9DGsFQ33g526d8aXChM3YpCURxS_d4YZuSwQ5uGJTzsnMKH42CH-z7K9KeaHbqLaJxw5cOJN_6VLvaRbQZ8SivBD9KCmcPtAqm7kWGsbrMKoN_CHyvKsxfOBMhzJ79f",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCV2P3riUp8gz8tWtYG_xq0tWzE6zC8wVD7gSHxFm-EjBBBlt91WHEXqJTSjZgCaAbMMYR1VT0GBhtwicqj7eiSTnx-sJpbhAabPDPOQBnNJCg-BbHEO7zlncYFG759_jdqdiyM4gbZldIXlmDMBZn6qB9V2PUtPWR0fzqCo4iDKOSFIXwO9QB2D_7wJe4uTUx8nYyrqWsrl3NzqMaZOrfOddEJuYslKO5YkjYWuEXsxGDLD4LYE3fgnMttISzR9cIFxpyDo_W__8JM",
  ],
};

export const mockStorefrontLots = [
  { id: 1, lotNumber: "42", title: "1968 Rolex Cosmograph Daytona", currentBid: 185000, timeLeft: "01:22:15", isLive: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuANdqKPl56gFtN5wAeZz0XhHftC5rwSX_G1hB3LouYzJsFUbLmMdEdI42L1QXoiA4BPVgcOLEOlLikc3-UvuU5xqHLmsLpcLLsO3AIM2Y-I6qzA6L2u-JMSrojMwvmF95mtIh5cB09y7-yfQMk_bBA5wDwE4R7l_VwH5MwRAYEI7yUyz3mG1BiAuGiaHBSEFgj7ZUeeNhromQ3jROgNDKnYUEyrP0UL9A4R8KrufKsxK_RNCE1eMdpXdup8biX87SClJiqGk5a4xLTT" },
  { id: 2, lotNumber: "17", title: "Bronze Sculpture, 'Continuum'", currentBid: 42500, timeLeft: "03:45:10", isLive: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_D1a27UndMYzpeK1DXDFFxP-4izgqbZ3SbZHTu6RHfl37zV8ws5mlRSUO0Clp16UyFGkDv-NFg-Zroiii-Kw_ViBmVEiD1Ro9qOg0UbZk5GSf4qfnOGMB72kCude986W19MD4Ok_BJNykvlr-QgGQ92rYfrBfMMZNGX34p0sDcc4yLxk0odeBufJIIkCeMBBkeTe-vp_vhUk05fk_wgzNOmu6sAEcg3SvR-rMpCiIWm052DyEw04N1pEjnFbkmxQga_Lzyx_L-UVc" },
  { id: 3, lotNumber: "29", title: "Patek Philippe Nautilus 5711/1A", currentBid: 125000, timeLeft: "00:58:30", isLive: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuANdqKPl56gFtN5wAeZz0XhHftC5rwSX_G1hB3LouYzJsFUbLmMdEdI42L1QXoiA4BPVgcOLEOlLikc3-UvuU5xqHLmsLpcLLsO3AIM2Y-I6qzA6L2u-JMSrojMwvmF95mtIh5cB09y7-yfQMk_bBA5wDwE4R7l_VwH5MwRAYEI7yUyz3mG1BiAuGiaHBSEFgj7ZUeeNhromQ3jROgNDKnYUEyrP0UL9A4R8KrufKsxK_RNCE1eMdpXdup8biX87SClJiqGk5a4xLTT" },
  { id: 4, lotNumber: "38", title: "Impressionist Landscape in Oil", currentBid: 89000, timeLeft: "02:15:45", isLive: true, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_D1a27UndMYzpeK1DXDFFxP-4izgqbZ3SbZHTu6RHfl37zV8ws5mlRSUO0Clp16UyFGkDv-NFg-Zroiii-Kw_ViBmVEiD1Ro9qOg0UbZk5GSf4qfnOGMB72kCude986W19MD4Ok_BJNykvlr-QgGQ92rYfrBfMMZNGX34p0sDcc4yLxk0odeBufJIIkCeMBBkeTe-vp_vhUk05fk_wgzNOmu6sAEcg3SvR-rMpCiIWm052DyEw04N1pEjnFbkmxQga_Lzyx_L-UVc" },
];
