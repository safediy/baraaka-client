const constant = Object.freeze({
  LEVEL_ROLES: ['ROOT', 'PLATFORM_ADMIN', 'PLATFORM_FINANCE', 'PLATFORM_USER', 'COMPANY_ADMIN', 'COMPANY_USER'],
  ROLE_TYPE: {
    ROOT: 'ROOT',
    PLATFORM_ADMIN: 'PLATFORM_ADMIN',
    PLATFORM_USER: 'PLATFORM_USER',
    PLATFORM_FINANCE: 'PLATFORM_FINANCE',
    COMPANY_ADMIN: 'COMPANY_ADMIN',
    COMPANY_USER: 'COMPANY_USER'
  },
  PLATFORM_ROLES: ['ROOT', 'PLATFORM_ADMIN', 'PLATFORM_USER', 'PLATFORM_FINANCE'],
  COMPANY_ROLES: ['COMPANY_ADMIN', 'COMPANY_USER'],
  PRICE_TYPES: ['AUTO', 'FIXED', 'AUTO_CUSTOM_CYCLE'],
  WAYBILL_STATUS: ['CREATED', 'Yiwu', 'Ulugchat', 'Osh', 'Toshkent'],
  WAYBILL_STATUS_TYPE: {
    CREATED: 'primary',
    CourierGave: 'primary',
    Yiwu: 'primary',
    Ulugchat: 'primary',
    Osh: 'primary',
    Toshkent: 'success',
    RETURNED: 'primary',
    DAMAGED: 'danger',
    ISSUE: 'danger'
  },
  WAYBILL_STATUS_DESCRIPTION: {
    CREATED: "Trek raqam qo'shildi",
    CourierGave: 'Kuryer olib keldi.',
    UN_LAWFUL: 'Taqiqlangan buyurtma ❗️',
    Warehouse: 'Xitoy omboriga yetib keldi.',
    Yiwu: "O'zbekistonga yuborildi.",
    Ulugchat: "Ulug'chat orqali o'tmoqda.",
    Osh: "O'sh shahridan o'tmoqda.",
    Toshkent: "O'zbekiston omboriga yetib keldi.",
    ReProcessing: 'Qayta ajratib saralanmoqda.',
    Approaching: 'Topshirish punktiga yetkazilmoqda.',
    Dropzone: 'Topshirish punktida.',
    Delivered: 'Yetkazib berildi.',
    RETURNED: 'Qaytariladigan tovar',
    DAMAGED: 'Singan tovar',
    ISSUE: 'Muammoli tovar'
  },
  BOX_STATUS_DESCRIPTION: {
    CREATED: "Trek raqam qo'shildi",
    UN_LAWFUL: 'Taqiqlangan buyurtma ❗️',
    Warehouse: 'Xitoy omboriga yetib keldi.',
    Yiwu: "O'zbekistonga yuborildi.",
    Ulugchat: "Ulug'chat orqali o'tmoqda.",
    Osh: "O'sh shahridan o'tmoqda.",
    Toshkent: "O'zbekiston omboriga yetib keldi.",
    ReProcessing: 'Qayta ajratib saralanmoqda.',
    Approaching: 'Topshirish punktiga yetkazilmoqda.',
    Dropzone: 'Topshirish punktida.',
    Delivered: 'Yetkazib berildi.',
    RETURNED: 'Qaytariladigan tovar',
    DAMAGED: 'Singan tovar',
    ISSUE: 'Muammoli tovar'
  },
  PAY_STATUS: ['UN_BILLED', 'UN_PAID', 'PAID']
})
export default Object.freeze(constant)
