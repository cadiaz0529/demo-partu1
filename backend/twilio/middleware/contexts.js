const contexts = [

    // Zero level, core to start the application
    { name: 'menu-principal', level: 0 },

    // First level, this means, you have reached the first response
    { name: 'menu-principal-leido', level: 1 },


    // Second level, you only have to be in one of them.
    { name: 'menu-brilla', level: 2 },
    { name: 'menu-certificados', level: 2 },
    { name: 'menu-facturacion_cartera', level: 2 },
    { name: 'menu-modificacion_instalacion_gas', level: 2 },
    { name: 'menu-nueva_instalacion_gas', level: 2 },
    { name: 'menu-revision_periodica', level: 2 },
    { name: 'menu-tramites', level: 2 },
    
    // Third level, it is only data collection
    { name: 'confirmation-request', level: 3 },
    { name: 'confirmation-set', level: 3 },
    { name: 'contract-request', level: 3 },
    { name: 'contract-set', level: 3 },
    { name: 'date-request', level: 3 },
    { name: 'date-set', level: 3 },
    { name: 'habeas-data-request', level: 3 },
    { name: 'habeas-data-set', level: 3 },
    { name: 'identification-request', level: 3 },
    { name: 'identification-set', level: 3 },
    { name: 'person-request', level: 3 },
    { name: 'person-set', level: 3 },
    { name: 'phone-request', level: 3 },
    { name: 'phone-set', level: 3 },
    { name: 'phone-token-request', level: 3 },
    { name: 'phone-token-set', level: 3 },
];

module.exports=  {
    contexts,
} ;