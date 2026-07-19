from pathlib import Path
root=Path('src/main/java')
repls={
'org.example.backend.entity.Conversation':'com.auction.chat.entity.Conversation',
'org.example.backend.entity.Message':'com.auction.chat.entity.Message',
'org.example.backend.entity.User':'com.auction.account.entity.User',
'org.example.backend.entity.Role':'com.auction.account.entity.Role',
'org.example.backend.enums.ConversationStatus':'com.auction.chat.enums.ConversationStatus',
'org.example.backend.repository.ConversationRepository':'com.auction.chat.repository.ConversationRepository',
'org.example.backend.repository.MessageRepository':'com.auction.chat.repository.MessageRepository',
'org.example.backend.repository.UserRepository':'com.auction.account.dao.UserRepository',
'org.example.backend.repository.RoleRepository':'com.auction.account.dao.RoleRepository',
'org.example.backend.security.UserDetailsImpl':'com.auction.account.security.UserDetailsImpl',
'org.example.backend.security.JwtService':'com.auction.account.security.JwtService',
'org.example.backend.security.UserDetailsServiceImpl':'com.auction.account.security.UserDetailsServiceImpl',
'org.example.backend.security.WebSocketAuthInterceptor':'com.auction.chat.security.WebSocketAuthInterceptor',
'org.example.backend.service.ConversationService':'com.auction.chat.service.ConversationService',
'org.example.backend.service.MessageService':'com.auction.chat.service.MessageService',
'org.example.backend.dto.request.CreateConversationRequest':'com.auction.chat.dto.request.CreateConversationRequest',
'org.example.backend.dto.request.SendMessageRequest':'com.auction.chat.dto.request.SendMessageRequest',
'org.example.backend.dto.response.ConversationResponse':'com.auction.chat.dto.response.ConversationResponse',
'org.example.backend.dto.response.ConversationDetailResponse':'com.auction.chat.dto.response.ConversationDetailResponse',
'org.example.backend.dto.response.MessageResponse':'com.auction.chat.dto.response.MessageResponse',
'com.hoangxuananhtuan.auction.domain.':'com.auction.bidding.entity.',
'com.hoangxuananhtuan.auction.repository.':'com.auction.bidding.repository.',
}
for p in root.rglob('*.java'):
    s=p.read_text(encoding='utf-8')
    ns=s
    for a,b in repls.items(): ns=ns.replace(a,b)
    if ns!=s: p.write_text(ns,encoding='utf-8')

# Ensure imports for account services using moved common services.
for rel, imports in {
 'com/auction/account/service/PasswordResetService.java':['com.auction.common.service.MailService'],
 'com/auction/account/service/EmailVerificationService.java':['com.auction.common.service.MailService'],
 'com/auction/account/service/IdentityVerificationService.java':['com.auction.common.service.OcrService'],
 'com/auction/bidding/entity/Auction.java':['com.auction.product.entity.Product','com.auction.account.entity.User'],
 'com/auction/bidding/entity/AuctionDeposit.java':['com.auction.account.entity.User'],
 'com/auction/bidding/service/impl/DepositServiceImpl.java':['com.auction.bidding.repository.AuctionRepository','com.auction.account.dao.UserRepository','com.auction.wallet.repository.WalletRepository','com.auction.wallet.repository.TransactionRepository','com.auction.bidding.repository.AuctionDepositRepository'],
 'com/auction/chat/security/WebSocketAuthInterceptor.java':['com.auction.account.security.JwtService','com.auction.account.security.UserDetailsServiceImpl'],
}.items():
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
