export const selectors = {
    // group selector
    groupListItemSelectorById: (id: number) => `#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id})`,
    groupListItemSelector:                     '#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div > div.friend-info',
    // group info selector
    groupListItemTitleSelectorById: (id: number) => `#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id}) > div > div.friend-info > div.detail-info > div.name-wrapper > span`,
    groupListItemTitleSelector: '#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div > div.friend-info > div.detail-info > div.name-wrapper > span',
    groupListItemContextMenuSelectorById: (id: number) : string => `body > div.popover-v3 > div.zmenu-body > div > div > div-${id} > div.truncate.flx-1`,
    communityMemberCountSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.community__chat-box-indicator > span.flx.flx-al-c.clickable.community__chat-box-indicator__mem > span:nth-child(2)',
    groupMemberCountSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.subtitle__groupmember__content.flx.flx-al-c.clickable > div',
    groupMemberCountBackSelector: '#chatInfo > div.chat-info__header.web > div-b18 > div > div > i',
    groupAvatarSelector: '#ava_chat_box_view',
    groupImageSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container > div.pi-info-layout__mini-info-container > div > div.rel.zavatar-container.pi-mini-info-section__avatar > div.zavatar.zavatar-xxll.zavatar-single.flx.flx-al-c.flx-center.rel.disableDrag.clickable > img',
    groupLinkSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div > div > div > div:nth-child(1) > div > div.flx.flx-col.flx-center.flx-1 > div.pi-group-profile-link__link',
    groupInfoToggleButtonSelector: '#headerBtns > div.z--btn--v2.btn-tertiary-neutral.medium.focused.--rounded.icon-only > i',
    groupMediaViewAllButtonSelector: '#shared-images-container > div.slideToTop.w100 > div.z--btn--v2.btn-neutral.medium.view-more__full.--full-width.view-more__full', // redefine it
    groupFileViewAllButtonSelector: '#info-files-container > div.slideToTop > div > div.z--btn--v2.btn-neutral.medium.wi.view-more__full.--rounded.wi.view-more__full', //redefine it
    groupLinkViewAllButtonSelector: '#info-links-container > div.chat-info-link__group__items.fadeInLoading.slideToTop > div.z--btn--v2.btn-neutral.medium.wi.view-more__full.--rounded.wi.view-more__full', //redefine it
    groupPhotoesAndVideosTabSelector: '#chatInfoMedia > div > div.tab-bar.flx.flx-sp-btw > div > div:nth-child(1)',
    groupFilesTabSelector: '#chatInfoMedia > div > div.tab-bar.flx.flx-sp-btw > div > div:nth-child(2)',
    groupLinksTabSelector: '#chatInfoMedia > div > div.tab-bar.flx.flx-sp-btw > div > div:nth-child(3)',
    groupPhotoesAndVideoPreviewItemSelector: '.img-media .media-store-preview-item .common-overlay',
    groupPhotoesAndVideoDownloadButtonSelector: '#zl-modal__dialog-body > div > div > div.media-viewer__footer > div.media-viewer__footer__child.image-action > action-group:nth-child(1) > div:nth-child(2)',
    groupPhotoesAndVideoNextButtonSelector: '#zl-modal__dialog-body > div > div > div.media-viewer__body > div.media-viewer__body__left.--has-slider > div.navigatorWrapper > div > i.navBtn.fa.fa-Chevron_Up_24_Line',
    groupPhotoesItemSelector: 'div.media-store.image-box.--render-success > div.image-box__image > img[src^="blob"]',
     
    groupVideosItemSelector: 'div.media-store.image-box.--render-success > div.image-box__image > video',
    groupFileItemSelector: '#innerScrollContainer > div', //define it,
    groupFileItemDownloadIconSelector: 'div > div.file-layout.cb-info-file-item__wrapper > div.file-layout__right-container > div.file-layout__top-container > div.file-actions-row.cb-info-file-item__actions-container > div:nth-child(1) > div > i',
    groupFileExceptionItemDownloadIconSelector: 'div > div.file-layout.cb-info-file-item__wrapper > div.file-layout__right-container > div.file-layout__top-container > div.file-actions-row.cb-info-file-item__actions-container > div:nth-child(2) > div > i',
    groupFileHoverIconSelector: 'div > div.file-layout.cb-info-file-item__wrapper > div.file-layout__right-container > div.file-layout__top-container > div.file-actions-row.cb-info-file-item__actions-container > div',
    groupFileItemNameSelector: 'div > div.file-layout.cb-info-file-item__wrapper > div.file-layout__right-container > div.file-layout__top-container > div.cb-info-file-item__file-name.margin-bottom-4',
    groupLinkItemSelector: '#innerScrollContainer > div',
    groupLinkItemTextSelector: 'div > div.z-ml.chat-info-link__right > div.media-item-date.flx > div.chat-info-link__title',
    // member info selector
    groupMemberSelectorById: (id: number) => `#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id}) > div`,
    groupMemberSelector: '#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div',
    groupMemberNameSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container.pi-info-layout__primary-info-container_has-cover > div.pi-info-layout__mini-info-container > div > div.pi-mini-info-section__info > div.pi-mini-info-section__name > div > div.truncate',
    groupMemberBioSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(1)',
    groupMemberGenderSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(2)',
    groupMemberBirthdaySelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(3)',
    groupMemberPhoneNumberSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(4)',
    groupMemberInfoListItemContentSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div.pi-info-card.pi-page-bottom-margin > div > div > div > div > span.content-copiable',
    groupMemberInfoListItemTitleSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div.pi-info-card.pi-page-bottom-margin > div > div > div > div > span.pi-info-item__title',
    groupMemberInfoListItemContentSelectorById: (id: number) => `#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(${id})`,
    groupMemberInfoListItemTitleSelectorById: (id: number) => `#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div.pi-info-card.pi-page-bottom-margin > div > div > div:nth-child(${id}) > div > span.pi-info-item__title`,
    groupMemberInfoListItemAvatarSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container.pi-info-layout__primary-info-container_has-cover > div.pi-info-layout__mini-info-container > div > div.rel.zavatar-container.pi-mini-info-section__avatar > div > img',
    groupMemberInfoListItemCoverImageSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-cover.clickable.rel > img',
    groupMemberInfoRoleSelector: 'div.chat-box-member__info__name.v2 > span',
    groupMemberInfoSearchInputSelector: '#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div > span > input',
    groupMemberInfoAddMemberButtonSelector: '#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(1) > div.chat-box-member__add-member',
    // my profile info selector
    groupMemberMyNameSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container.pi-info-layout__primary-info-container_has-cover > div.pi-info-layout__mini-info-container > div > div.pi-mini-info-section__info > div.pi-mini-info-section__name > div > div.truncate',
    groupMemberMyInfoListItemTitleSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div > div > div.pi-info-section__info-list > div > div > span.pi-info-item__title',
    groupMemberMyInfoListItemContentSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div > div > div.pi-info-section__info-list > div > div > span.content-copiable',
    groupMemberIsBusinessSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div.pi-info-section__cta > div.z--btn--v2.btn-tertiary-neutral.medium.--full-width',
    groupMemberMyInfoListItemAvatarSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container.pi-info-layout__primary-info-container_has-cover > div > div > div.rel.zavatar-container.pi-mini-info-section__avatar > div.zavatar.zavatar-xxll.zavatar-single.flx.flx-al-c.flx-center.rel.disableDrag.clickable > img',
    // Business profile info selector
    groupMemberBusinessNameSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container > div > div > div.pi-mini-info-section__info > div.pi-mini-info-section__name > div > div',
    groupMemberBusinessInfoListItemTitleSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(2) > div > div > div > div > span.pi-info-item__title',
    groupMemberBusinessInfoListItemContentSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(2) > div > div > div > div > span.content-copiable',
    groupMemberBusinessInfoListDescriptionSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div.pi-info-card.pi-page-bottom-margin > div > div > div > div > span.content-copiable > div',
    // menu selector
    menuContactSelector: '#ContactTabV2 > div > div:nth-child(2)',
    mainTabItemSelector: '#main-tab > div:nth-child(1) > div.nav__tabs__top > div:nth-child(2)',
    
    // group page component selector
    groupTypeSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.community__chat-box-indicator > span:nth-child(1) > span.ws-no-wrap',
    // scroll selector
    memberListScrollSelector: '#member-group > div:nth-child(1) > div > div:nth-child(1)',
    groupListScrollSelector: '#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(3) > div',
    messageListScrollSelector: '#messageViewContainer > div:nth-child(1)',
    // settingItem selector
    settingButtonSelector: '#main-tab > div.nav__tabs__bottom > div:nth-child(4)',
    settingLanguageMenuSeletor: 'body > div.popover-v3 > div.zmenu-body.has-submenu > div > div > div-14:nth-child(6)',
    settingLanguageItemSelectorById: (id: number) => `body > div.popover-v3 > div.zmenu-body.has-submenu > div > div > div-14.zmenu-item.--SUBMENU.md.hovered > div.zmenu-sub.hovered > div > div-14:nth-child(${id})`,
    // Real time detection selector
    unreadMessageBadgeSelector: '#main-tab > div:nth-child(1) > div.nav__tabs__top > div:nth-child(1) > div.z-noti-badge-container > div',
    unreadGroupItemSelector: '#conversationList > div > div',
    unreadGroupItemSelectorById: (id: number) => `#conversationList > div > div:nth-child(${id})`,
    unreadGroupItemBadgeSelector: '#conversationList > div > div > div > div.conv-item-body__action.hasOption.grid-item > div > div > i',
    unreadGroupItemBadgeSelectorById: (id: number) => `#conversationList > div > div:nth-child(${id}) > div > div.conv-item-body__action.hasOption.grid-item > div > div > i`,
    // Message Selector
    groupMessageTextSelector:   '#messageViewScroll > div > div.chat-item.flx > div.chat-content.flx.flx-col.flx-cell > div > div > div.chatImageMessage.img-msg-v2.-caption.-admin > div.-admin.img-msg-v2__bub.--capt > div.msg-select-overlay.img-msg-v2__ft > div.img-msg-v2__cap > div',
    groupMessageTimeSelector:   '#messageViewScroll > div > div.chat-item.flx > div.chat-content.flx.flx-col.flx-cell > div > div > div.chatImageMessage.img-msg-v2.-caption.-admin > div.-admin.img-msg-v2__bub.--capt > div.msg-select-overlay.img-msg-v2__ft > div.img-msg-v2__st > div',
    groupMessageAuthorSelector:      '#messageViewScroll > div > div.chat-item.flx > div.chat-content.flx.flx-col.flx-cell > div > div > div.chatImageMessage.img-msg-v2.-caption.-admin > div.img-msg-v2__dn',
    groupMessageSelector: '#messageViewScroll > div.block-date > div.chat-item.flx > div > div.chat-message',
    groupMessageBlockSelectorByAuthor: '#messageViewScroll > div.block-date > div.chat-item',
    groupMessageSelectorById: (id: number) => `#messageViewScroll > div.block-date > div.chat-item.flx > div > div:nth-child(${id})`,
    groupMessageBlockSelectorByDate: '#messageViewScroll > div.block-date',
    groupMessageDateSelector: '#messageViewScroll > div.block-date > div.chat-date.--time.island > span > span',
    groupMessageQuoteTextSelector: 'div.quote-text.truncate',
}
export const databasePath = (groupName: string) => {
    let validGroupName = groupName.replace('/', '-')
    return `jsonDatabase/GroupAndCommunityData/${validGroupName}/`;
}

export const databasePath1 = (groupName: string) => {
    let validGroupName = groupName.replace('/', '-')
    return `jsonDatabase/GroupAndCommunityData1/${validGroupName}/`;
}