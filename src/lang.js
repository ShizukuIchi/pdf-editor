
let locales = {}

locales['en'] = {
    RenamePDF: 'Rename your PDF here',    
    OpenPDF: 'Choose PDF',
    DropPDF: 'Drag something here',
    Save: 'Save',
    Saving: 'Saving',
    Cancel: 'Cancel',
    Done: 'Done'
}
locales['de'] = {
    RenamePDF: 'PDF umbenennen',
    OpenPDF: 'PDF Öffnen',
    DropPDF: 'PDF Drag & Drop',
    Save: 'Speichern',
    Saving: 'Speichern...',
    Cancel: 'Abbrechen',
    Done: 'OK'
}

const defaultLocale = 'en';

const navigatorLocale = Object.keys(locales).find(code => RegExp(`^${code}\b`).test(code));
const qsMatch = /.*lang=(.*\b).*/.exec(window.location.search);
const querystringLocale = qsMatch && qsMatch[1]

export var dict =  querystringLocale && locales[querystringLocale] || 
                navigatorLocale && locales[navigatorLocale] || 
                locales[defaultLocale]


