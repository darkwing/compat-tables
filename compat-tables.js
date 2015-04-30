/*

    From Whitlock, to get cell data:

    meta.compat_table.supports[feature.id][browser.id] = [support1.id, support2.id]

*/

function loadTable(payload, locale, isDebug) {

    log('---------------------' + payload.features.name.en + '---------------------');

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
            var browserName = getLocaleOrDefaultFromObject(matchedBrowserObj.name);
            var slugForCss = matchedBrowserObj.slug; // Kind of a big assumption

            output += '<th class="bc-browser-' + slugForCss + '-HELP">'; // PROBLEM:  No way to  identify "bc-browser-{browser}-{env}" for class
            output += '<abbr class="only-icon" title="' + browserName +'">';
            output += '<span>' + browserName + '</span>'; // PROBLEM:  No way of knowing "for Desktop" (localization issue)
            output += '<i aria-hidden="true" class="ic-' + slugForCss + '"></i>';
            output += '</abbr>';

            if(isDebug) output += ' <code class="debug-detail">(' +  browserId +')</code>';

            output += '</th>';
        });
    });
    output += '</tr>';

    output += '</thead>';

    // BODY
    // ===============================
    output += '<tbody>';
    payload.linked.features.forEach(function(feature) {
        output += '<tr>';
        output += '<th scope="row">' + getLocaleOrDefaultFromObject(feature.name) + (isDebug ? '<br><code class="debug-detail">(' + feature.id + ')</code>' : '') + '</th>';

        tabs.forEach(function(tab) {
            tab.browsers.forEach(function(browserId) {
                var browserFeatureResult = payload.meta.compat_table.supports[feature.id][browserId];
                var currentBrowserObj;

                var cell = {
                    className: '',
                    content: ''
                };

                log(feature.id, '|', browserId, '|', browserFeatureResult);

                if(browserFeatureResult) {

                    // Assume the last item is the "current"
                    // This will likely need to change in the future
                    currentBrowserObj = findObjectByIdInArray(browserFeatureResult.pop(), payload.linked.supports);

                    // Determine support via classname
                    // PROBLEM:  Need to add  bc-browser-{browser}-{desktop|mobile} (ex: "bc-browser-firefox-desktop")
                    cell.className = 'bc-supports-' + currentBrowserObj.support;

                    // Build up the content 
                    // This is going to need a ton of logic 
                    cell.content += '(' + currentBrowserObj.support + ')'; // PROBLEM:  This requires localization for "Yes" and "No"

                    // Determine support
                    log('current', currentBrowserObj);

                    // Just debug
                    //browserFeatureResult.forEach(function(id) { log(findObjectByIdInArray(id, payload.linked.supports)); });
                }
                else {
                    cell.className = 'bc-supports-unknown';
                    cell.content += '(none)';
                }

                if(isDebug) {
                    cell.content += '<br><br><br><br><br><code class="debug-detail-alt" title="feature id">' + feature.id + '</code> <code class="debug-detail-alt2" title="browser id">' + browserId + '</code> <code class="debug-detail" title="result">' + browserFeatureResult + '</code>';
                }

                output += '<td class="' + cell.className + '"> ' + cell.content + '</td>';

            });
        });

        output += '</tr>';
    });
        
        /* SOME TYPEOF LOOP HERE */
        payload.linked.supports; // Supports array; need to connect to browsers

    output += '</tbody>';

    // Table close
    output += '</table>';

    log('---------------------/' + payload.features.name.en + '---------------------');

    return output;



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

    function log(data) {
        if(isDebug && console && console.log) {
            console.log.apply(console, arguments);
        }
        return data;
    }

};