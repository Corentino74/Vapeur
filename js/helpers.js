// ---- Helpers Handlebars pour les templates, mis dans ce fichier séparé ----

// Ces fonctions peuvent être séparées du serveur principal

// Helper pour formater les dates en français
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

// Helper pour vérifier l'égalité dans les templates
function eq(a, b) {
    return a === b;
}

// Helper pour vérifier la non-égalité dans les templates
function unless(conditional, options) {
    if (!conditional) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
}

// Helper pour vérifier si un tableau contient une valeur
function includes(array, value) {
    if (!array || !Array.isArray(array)) return false;
    return array.some(item => {
        if (typeof item === 'object' && item.genre) {
            return item.genre.id === value;
        }
        return item === value;
    });
}

// Helper pour vérifier si un genre est sélectionné dans un jeu
function isGenreSelected(jeuGenres, genreId) {
    if (!jeuGenres || !Array.isArray(jeuGenres)) return false;
    return jeuGenres.some(jeuGenre => jeuGenre.genre.id === genreId);
}

// Helper pour générer automatiquement des champs de formulaire complets
function formField(options) {
    const { type = 'text', id, name, label, required, value = '', placeholder = '', rows } = options.hash;
    
    const reqAttr = required ? ' required' : '';
    const valAttr = value ? ` value="${value}"` : '';
    const placeholderAttr = placeholder ? ` placeholder="${placeholder}"` : '';
    
    let input;
    if (type === 'textarea') {
        input = `<textarea id="${id}" name="${name}"${reqAttr}${rows ? ` rows="${rows}"` : ''}${placeholderAttr}>${value}</textarea>`;
    } else if (type === 'select') {
        input = `<select id="${id}" name="${name}"${reqAttr}>${options.fn(this)}</select>`;
    } else {
        input = `<input type="${type}" id="${id}" name="${name}"${reqAttr}${valAttr}${placeholderAttr}>`;
    }
    
    const hbs = require("hbs");
    return new hbs.SafeString(
        `<div class="form-group">` + `<label for="${id}">${label}${required ? ' *' : ''}</label>` + `${input} ` + `</div>`
    );
}

// Fonction pour enregistrer tous les helpers Handlebars
function registerHandlebarsHelpers(hbs) {
    hbs.registerHelper('formatDate', formatDate);
    hbs.registerHelper('eq', eq);
    hbs.registerHelper('unless', unless);
    hbs.registerHelper('includes', includes);
    hbs.registerHelper('isGenreSelected', isGenreSelected);
    hbs.registerHelper('formField', formField);
}

module.exports = {
    formatDate,
    eq,
    unless,
    includes,
    isGenreSelected,
    formField,
    registerHandlebarsHelpers
};