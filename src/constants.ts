export const selectors = {
    // group selector
    groupListItemSelectorById: (id: number) => `#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id})`,
    groupListItemSelector:                     '#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div > div.friend-info',

    // group info selector
    groupListItemTitleSelectorById: (id: number) => `#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id}) > div > div.friend-info > div.detail-info > div.name-wrapper > span`,
    groupListItemContextMenuSelectorById: (id: number) : string => `body > div.popover-v3 > div.zmenu-body > div > div > div-${id} > div.truncate.flx-1`,
    communityMemberCountSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.community__chat-box-indicator > span.flx.flx-al-c.clickable.community__chat-box-indicator__mem > span:nth-child(2)',
    groupMemberCountSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.subtitle__groupmember__content.flx.flx-al-c.clickable > div',
    groupAvatarSelector: '#ava_chat_box_view > div.rel.zavatar-container > div > img',
    
    groupMemberSelectorById: (id: number) => `#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id}) > div`,
    groupMemberSelector: '#member-group > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div',
    groupMemberNameSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__primary-info-container.pi-info-layout__primary-info-container_has-cover > div.pi-info-layout__mini-info-container > div > div.pi-mini-info-section__info > div.pi-mini-info-section__name > div > div.truncate',
    groupMemberBioSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(1)',
    groupMemberGenderSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(2)',
    groupMemberBirthdaySelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(3)',
    groupMemberPhoneNumberSelector: '#zl-modal__dialog-body > div > div > div > div > div:nth-child(1) > div > div.pi-info-layout__extra-info-container > div:nth-child(1) > div > div > div:nth-child(4)',
    // menu selector
    menuContactSelector: '#ContactTabV2 > div > div:nth-child(2)',
    mainTabItemSelector: '#main-tab > div:nth-child(1) > div.nav__tabs__top > div:nth-child(2)',
    
    // group page component selector
    groupTypeSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.community__chat-box-indicator > span:nth-child(1) > span.ws-no-wrap',
}

export const databasePath = (groupName: string) => `jsonDatabase/GroupAndCommunityData/${groupName}/`;