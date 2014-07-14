module.exports = function (db) {
    db.Country.bulkCreate([
        { code: 'FR', name: 'France' },
        { code: 'US', name: 'United States' },
        { code: 'PT', name: 'Portugal' }
    ]).then(function () {
        return db.Department.bulkCreate([
            { code: '03', name: 'Allier', region: '1' },
            { code: '83', name: 'Var', region: '1' },
            { code: '06', name: 'Hautes-Alpes', region: '1' }
        ])
    }).then(function () {
        return db.Address.bulkCreate([
            { address1: 'Rue des Oliviers', address2: 'La Maisonette', zipCode: '03220', city: 'Trezelles', departmentId: 1, countryId: 1 },
            { address1: 'Avenue des Bozo', address2: 'Rouberre', zipCode: '83521', city: 'Vieilloles', departmentId: 2, countryId: 1 },
            { address1: '1415 E Denny Way', address2: 'Capitol Hill', zipCode: '98122', city: 'Seattle', state: 'WA', countryId: 2 }
        ])
    }).then(function () {
        return db.User.bulkCreate([
            { email: 'plop@plop.com', passwordHash: 'thisisnotarealhash', firstName: 'Bob', lastName: 'Dylan', birthDate: '1989-06-25 04:15:10', phone: '206-012-3465', isAdmin: false },
            { email: 'host@foo.com', passwordHash: '64faf5d0b1dc311fd0f94af64f6c296a03045571', firstName: 'Jean', lastName: 'Bon', birthDate: '1977-02-08 04:15:10', phone: '206-012-3465', isAdmin: false },
            { email: 'wwoofer@foo.com', passwordHash: '64faf5d0b1dc311fd0f94af64f6c296a03045571', firstName: 'Helen', lastName: 'Polmino', birthDate: '1984-10-10 10:10:25', phone: '206-012-3465', isAdmin: false },
            { email: 'admin@foo.com', passwordHash: '64faf5d0b1dc311fd0f94af64f6c296a03045571', firstName: 'Super', lastName: 'Admin', birthDate: '1974-08-03 02:45:25', phone: '206-012-3465', isAdmin: true }
        ])
    }).then(function () {
        return db.Host.bulkCreate([
            { farmName: 'La Belle Ferme', shortDescription: 'Ferme Bio dans le marais', fullDescription: 'Une description complete prendrait trop de place.', webSite: 'http://pouet.com', travelDetails: 'On vient vous prendre a la gare y\' pas sourcis!', isPending: false, isSuspended: false, addressId: 1, userId: 1 },
            { farmName: 'La Grange Verte', shortDescription: 'Ferme de fromages bio!', fullDescription: 'Encore un fois, une description complete prendrait trop de place.', webSite: 'http://plop.com', travelDetails: 'On vient vous prendre a la gare y\' pas sourcis!', isPending: false, isSuspended: false, addressId: 2, userId: 2 }
        ])
    }).then(function () {
        return db.Photo.bulkCreate([
            { fileName: 'maison.jpg', caption: 'Photo de Maison', hostId: 1 },
            { fileName: 'arbre.jpg', caption: 'Ceci est un arbre', hostId: 1 },
            { fileName: 'farm.jpg', caption: 'This is a farm', hostId: 1 }
        ])
    }).then(function () {
        return db.Wwoofer.bulkCreate([
            { firstName2: 'Another', lastName2: 'Name', birthDate2: '1985-03-24 18:15:10', nationality: 'FR', intro: 'I\'m a believer!', tripMotivation: 'Je veux apprendre a faire du fromage!', addressId: 3, userId: 3 }
        ])
    }).then(function () {
        return db.Membership.bulkCreate([
            { type: 'H', paymentId: '123', payerId: '456', saleId: '789', expireAt: '2015-06-25 04:15:10', itemCode: 'H', paymentType: 'PPL', total: 25, userId: 2 },
            { type: 'H', paymentId: '123', payerId: '456', saleId: '789', expireAt: '2016-06-25 04:15:10', itemCode: 'HR', paymentType: 'PPL', total: 25, userId: 2 }
        ])
    });
};