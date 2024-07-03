"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databasePath = exports.selectors = void 0;
exports.selectors = {
    // group selector
    groupListItemSelectorById: (id) => `#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id})`,
    groupListItemSelector: '#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div > div.friend-info',
    // group info selector
    groupListItemTitleSelectorById: (id) => `#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id}) > div > div.friend-info > div.detail-info > div.name-wrapper > span`,
    groupListItemContextMenuSelectorById: (id) => `body > div.popover-v3 > div.zmenu-body > div > div > div-${id} > div.truncate.flx-1`,
    communityMemberCountSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.community__chat-box-indicator > span.flx.flx-al-c.clickable.community__chat-box-indicator__mem > span:nth-child(2)',
    groupMemberCountSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.subtitle__groupmember__content.flx.flx-al-c.clickable > div',
    groupMemberCountBackSelector: '#chatInfo > div.chat-info__header.web > div-b18 > div > div > i',
    groupAvatarSelector: '#ava_chat_box_view',
    groupImageSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container > div.pi-info-layout__mini-info-container > div > div.rel.zavatar-container.pi-mini-info-section__avatar > div.zavatar.zavatar-xxll.zavatar-single.flx.flx-al-c.flx-center.rel.disableDrag.clickable > img',
    groupLinkSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(3) > div > div > div:nth-child(1) > div > div.flx.flx-col.flx-center.flx-1 > div.pi-group-profile-link__link',
    groupInfoToggleButtonSelector: '#headerBtns > div.z--btn--v2.btn-tertiary-neutral.medium.focused.--rounded.icon-only > i',
    groupMediaViewAllButtonSelector: 'div.slideToTop.w100 > div.z--btn--v2.btn-neutral.medium.view-more__full.--full-width.view-more__full > div',
    groupFileViewAllButtonSelector: 'div.slideToTop.w100 > div.z--btn--v2.btn-neutral.medium.view-more__full.--full-width.view-more__full > div', //redefine it
    groupLinkViewAllButtonSelector: 'div.slideToTop.w100 > div.z--btn--v2.btn-neutral.medium.view-more__full.--full-width.view-more__full > div', //redefine it
    groupPhotoesAndVideosTabSelector: '#chatInfoMedia > div > div.tab-bar.flx.flx-sp-btw > div > div:nth-child(1)',
    groupFilesTabSelector: '#chatInfoMedia > div > div.tab-bar.flx.flx-sp-btw > div > div:nth-child(2)',
    groupLinksTabSelector: '#chatInfoMedia > div > div.tab-bar.flx.flx-sp-btw > div > div:nth-child(3)',
    groupPhotoesAndVideoPreviewItemSelector: '.img-media .media-store-preview-item .common-overlay',
    groupPhotoesAndVideoDownloadButtonSelector: '#zl-modal__dialog-body > div > div > div.media-viewer__footer > div.media-viewer__footer__child.image-action > action-group:nth-child(1) > div:nth-child(2)',
    groupPhotoesAndVideoNextButtonSelector: '#zl-modal__dialog-body > div > div > div.media-viewer__body > div.media-viewer__body__left.--has-slider > div.navigatorWrapper > div > i.navBtn.fa.fa-Chevron_Up_24_Line',
    groupPhotoesAndVideoItemSelector: 'div.media-store.image-box.--render-success > div.image-box__image > img',
    groupFileItemSelector: '#innerScrollContainer > div', //define it
    // member info selector
    groupMemberSelectorById: (id) => `#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id}) > div`,
    groupMemberSelector: '#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div',
    groupMemberNameSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container.pi-info-layout__primary-info-container_has-cover > div.pi-info-layout__mini-info-container > div > div.pi-mini-info-section__info > div.pi-mini-info-section__name > div > div.truncate',
    groupMemberBioSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(1)',
    groupMemberGenderSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(2)',
    groupMemberBirthdaySelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(3)',
    groupMemberPhoneNumberSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(4)',
    groupMemberInfoListItemContentSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div.pi-info-card.pi-page-bottom-margin > div > div > div > div > span.content-copiable',
    groupMemberInfoListItemTitleSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div.pi-info-card.pi-page-bottom-margin > div > div > div > div > span.pi-info-item__title',
    groupMemberInfoListItemContentSelectorById: (id) => `#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(${id})`,
    groupMemberInfoListItemTitleSelectorById: (id) => `#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div.pi-info-card.pi-page-bottom-margin > div > div > div:nth-child(${id}) > div > span.pi-info-item__title`,
    // menu selector
    menuContactSelector: '#ContactTabV2 > div > div:nth-child(2)',
    mainTabItemSelector: '#main-tab > div:nth-child(1) > div.nav__tabs__top > div:nth-child(2)',
    // group page component selector
    groupTypeSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.community__chat-box-indicator > span:nth-child(1) > span.ws-no-wrap',
    // scroll selector
    memberListScrollSelector: '#member-group > div:nth-child(1) > div > div:nth-child(1)',
    groupListScrollSelector: '#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(3) > div',
    messageListScrollSelector: '#scroll-vertical > div',
    // settingItem selector
    settingButtonSelector: '#main-tab > div.nav__tabs__bottom > div:nth-child(4)',
    settingLanguageMenuSeletor: 'body > div.popover-v3 > div.zmenu-body.has-submenu > div > div > div-14:nth-child(6)',
    settingLanguageItemSelectorById: (id) => `body > div.popover-v3 > div.zmenu-body.has-submenu > div > div > div-14.zmenu-item.--SUBMENU.md.hovered > div.zmenu-sub.hovered > div > div-14:nth-child(${id})`,
    // Real time detection selector
    unreadMessageBadgeSelector: '#main-tab > div:nth-child(1) > div.nav__tabs__top > div:nth-child(1) > div.z-noti-badge-container > div',
    unreadGroupItemSelector: '#conversationList > div > div',
    unreadGroupItemSelectorById: (id) => `#conversationList > div > div:nth-child(${id})`,
    unreadGroupItemBadgeSelector: '#conversationList > div > div > div > div.conv-item-body__action.hasOption.grid-item > div > div > i',
    unreadGroupItemBadgeSelectorById: (id) => `#conversationList > div > div:nth-child(${id}) > div > div.conv-item-body__action.hasOption.grid-item > div > div > i`,
};
const databasePath = (groupName) => {
    let validGroupName = groupName.replace('/', '-');
    return `jsonDatabase/GroupAndCommunityData/${validGroupName}/`;
};
exports.databasePath = databasePath;
