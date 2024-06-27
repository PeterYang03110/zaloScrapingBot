export const selectors = {
    // group selector
    groupListItemSelectorById: (id: number) => `#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div:nth-child(${id})`,
    groupListItemInfoSelector: '#container > div > div.card-list-wrapper > div > div:nth-child(1) > div > div:nth-child(1) > div > div > div > div > div.friend-info',
    groupListItemContextMenuSelectorById: (id: number) : string => `body > div.popover-v3 > div.zmenu-body > div > div > div-${id} > div.truncate.flx-1`,

    // menu selector
    menuContactSelector: '#ContactTabV2 > div > div:nth-child(2)',
    mainTabItemSelector: '#main-tab > div:nth-child(1) > div.nav__tabs__top > div:nth-child(2)',
    
    // group page component selector
    groupTypeSelector: '#header > div.threadChat.rel.flx.flx-1.flx-al-c.group > div.threadChat__title.flx-1.flx.flx-col.w0 > div:nth-child(2) > div > div.community__chat-box-indicator > span:nth-child(1) > span.ws-no-wrap',
}