from pathlib import Path
root=Path('src/main/java')
repls={
'com.swp391.dto.':'com.auction.product.dto.',
'com.swp391.entity.':'com.auction.product.entity.',
'com.swp391.repository.':'com.auction.product.repository.',
'com.swp391.service.':'com.auction.product.service.',
'com.hoangxuananhtuan.auction.dto.PageResponse':'com.auction.common.dto.PageResponse',
'com.hoangxuananhtuan.auction.dto.ProductDetailResponse':'com.auction.product.dto.ProductDetailResponse',
'com.hoangxuananhtuan.auction.dto.ProductSearchRequest':'com.auction.product.dto.ProductSearchRequest',
'com.hoangxuananhtuan.auction.dto.ProductSummaryResponse':'com.auction.product.dto.ProductSummaryResponse',
'com.hoangxuananhtuan.auction.service.ProductService':'com.auction.product.service.BiddingProductService',
'com.auction.bidding.entity.Transaction':'com.auction.wallet.entity.Transaction',
'org.example.backend.exception.ResourceNotFoundException':'com.auction.common.exception.ResourceNotFoundException',
}
for p in root.rglob('*.java'):
    s=p.read_text(encoding='utf-8')
    ns=s
    for a,b in repls.items(): ns=ns.replace(a,b)
    if ns!=s: p.write_text(ns,encoding='utf-8')

add_imports={
'com/auction/chat/entity/Conversation.java':['com.auction.account.entity.User'],
'com/auction/chat/entity/Message.java':['com.auction.account.entity.User'],
'com/auction/config/JwtAuthFilter.java':['com.auction.account.security.JwtService','com.auction.account.security.UserDetailsServiceImpl'],
'com/auction/product/controller/CategoryController.java':['com.auction.common.dto.ApiResponse'],
'com/auction/product/controller/ContractController.java':['com.auction.common.dto.ApiResponse'],
'com/auction/product/controller/ProductAdminController.java':['com.auction.common.dto.ApiResponse'],
'com/auction/product/controller/ProductController.java':['com.auction.common.dto.ApiResponse'],
}
for rel,imports in add_imports.items():
    p=root/rel
    if not p.exists(): continue
    s=p.read_text(encoding='utf-8')
    lines=s.splitlines()
    pkg_idx=next((i for i,l in enumerate(lines) if l.startswith('package ')),0)
    existing={l for l in lines if l.startswith('import ')}
    add=[f'import {imp};' for imp in imports if f'import {imp};' not in existing]
    if add:
        lines[pkg_idx+1:pkg_idx+1]=['']+add
        p.write_text('\n'.join(lines)+'\n',encoding='utf-8')
print('done')
