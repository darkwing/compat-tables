function loadTable(payload, hostDiv) {

    // Environment
    var locale = navigator.language;

    // Payload Shortcuts
    var tabs = payload.meta.compat_table.tabs;

    // Important Vars
    var numberOfBrowsers = getNumberOfBrowsers();

    var output = '';

    // TABLE
    // ===============================
    output += '<table class="bc-table bc-table-' + numberOfBrowsers + '">';

    // HEADER
    // ===============================
    output += '<thead>';
    output += '<tr class="bc-mediums">';
    output += '<td></td>';
    tabs.forEach(function(tab) {
        output += '<th colspan="' + tab.browsers.length +'" class="bc-medium-{HELP}">'; // PROBLEM:  No way to identify "bc-medium-{x}" (desktop|mobile) for class
        output += '<abbr class="only-icon" title="{HELP}">'; // PROBLEM:  No way to identify "Desktop" or "Mobile" for the title
        output += '<span>' + getLocaleOrDefaultFromObject(tab.name) + '</span>';
        output += '<i aria-hidden="true" class="ic-{HELP}"></i>'; // PROBLEM:  No way to identify "ic-{x}" (desktop|mobile) for class
        output += '</abbr>';
        output += '</th>';
    });
    output += '</tr>';

    output += '<tr class="bc-browsers">';
    output += '<td></td>';
    tabs.forEach(function(tab) {
        tab.browsers.forEach(function(browserId) {
            var matchedBrowserObj = findObjectByIdInArray(browserId, payload.linked.browsers);

            console.log(matchedBrowserObj.slug + ':  ', matchedBrowserObj);

            var browserName = getLocaleOrDefaultFromObject(matchedBrowserObj.name);
            var slugForCss = matchedBrowserObj.slug; // Kind of a big assumption

            output += '<th class="bc-browser-' + slugForCss + '-HELP">'; // PROBLEM:  No way to  identify "bc-browser-{browser}-{env}" for class
            output += '<abbr class="only-icon" title="' + browserName +'">';
            output += '<span>' + browserName + '</span>'; // PROBLEM:  No way of knowing "for Desktop" (localization issue)
            output += '<i aria-hidden="true" class="ic-' + slugForCss + '"></i>';
            output += '</abbr>';
            output += '</th>';
        });
    });
    output += '</tr>';

    output += '</thead>';

    // BODY
    // ===============================
    output += '<tbody>';
    payload.linked.features.forEach(function(feature) {
        console.log(feature);

        output += '<tr>';
        output += '<th scope="row">' + getLocaleOrDefaultFromObject(feature.name) + '</th>';

        output += '</tr>';
    });
        
        /* SOME TYPEOF LOOP HERE */
        payload.linked.supports; // Supports array; need to connect to browsers

    output += '</tbody>';

    // Table close
    output += '</table>';

    // Output the table, for giggles
    console.log('--------------------------------------------------------');
    console.log('--------------------------------------------------------');
    console.log('--------------------------------------------------------');
    document.getElementById(hostDiv).innerHTML = output;



    function getNumberOfBrowsers() {
        var numBrowsers = 0;

        tabs.forEach(function(tab) {
            numBrowsers += tab.browsers.length;
        });

        return numBrowsers;
    }

    function getLocaleOrDefaultFromObject(nameObj) {
        return typeof nameObj == "string" ? nameObj : (nameObj[locale] || nameObj[locale.split('-')[0]] || nameObj['en']);
    }

    function findObjectByIdInArray(id, array) {
        var match;
        array.forEach(function(obj) {
            if(match) return;

            if(obj.id === id) match = obj;
        });
        return match;
    }


};