/*

    TO DO
    ===============================

    1.  


    From Whitlock, to get cell data:

        -  meta.compat_table.supports[feature.id][browser.id] = [support1.id, support2.id]
        -  The last item in the array is the most current, everything else is relevant "history"

*/

function loadTable(payload, locale, isDebug) {

    log('---------------------' + payload.features.name.en + '---------------------');

    // Payload Shortcuts
    var tabs = payload.meta.compat_table.tabs;

    // Important Vars
    var numberOfBrowsers = getNumberOfBrowsers();

    // This is ultimately returned from the function
    var output = '';

    // Templates
    var iconTemplate = '<abbr title="{title}" class="only-icon"><span>{text}</span><i class="ic-{icon}" aria-hidden="true"></i></abbr>';

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
            
            var slugForCss = matchedBrowserObj.slug; // PROBLEM:  Kind of a big assumption

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

        console.warn(feature);

        output += '<tr>';
        output += '<th scope="row">';
        output += getLocaleOrDefaultFromObject(feature.name);

        // Account for icons in this cell
        if(feature.experimental || feature.standardized || feature.obsolete) {
            output += '<div class="bc-icons">';
            if(feature.experimental) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'experimental'
                });
            }
            if(feature.standardized === false) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'standardized'
                });
            }
            if(feature.obsolete) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'obsolete'
                });
            }
            output += '</div>';
        }

        if(isDebug) {
            output += '<br><code class="debug-detail">(' + feature.id + ')</code>';
        }
        output += '</th>';

        tabs.forEach(function(tab) {
            tab.browsers.forEach(function(browserId) {
                var browserFeatureHistory = payload.meta.compat_table.supports[feature.id][browserId];
                var currentBrowserObj;

                var cell = {
                    className: '',
                    content: ''
                };

                log(feature.id, '|', browserId, '|', browserFeatureHistory);

                if(browserFeatureHistory) {

                    // Assume the last item is the "current"
                    // This will likely need to change in the future
                    currentBrowserObj = findObjectByIdInArray(browserFeatureHistory.pop(), payload.linked.supports);

                    // Determine support via classname
                    // PROBLEM:  Need to add  bc-browser-{browser}-{desktop|mobile} (ex: "bc-browser-firefox-desktop")
                    cell.className = 'bc-supports-' + currentBrowserObj.support;

                    // Build up the content 
                    // This is going to need a ton of logic 
                    cell.content += '(' + currentBrowserObj.support + ')'; // PROBLEM:  This requires localization for "Yes" and "No"

                    // Account for any required icons
                    if( currentBrowserObj.prefix_mandatory || 
                        currentBrowserObj.alternate_name_mandatory || 
                        currentBrowserObj['protected'] || 
                        currentBrowserObj.notes ||
                        (currentBrowserObj.requires_config && currentBrowserObj.default_config && (currentBrowserObj.requires_config != currentBrowserObj.default_config))
                    ) {

                        cell.content += '<div class="bc-icons">';

                        // Browser Prefix
                        if(currentBrowserObj.prefix_mandatory) {
                            cell.content += substitute(iconTemplate, {
                                title: '{{ PROBLEM }}',
                                text: '{{ PROBLEM }}',
                                icon: 'prefix'
                            });
                        }

                        // Alternate Name Mandatory
                        if(currentBrowserObj.alternate_name_mandatory) {
                            cell.content += substitute(iconTemplate, {
                                title: '{{ PROBLEM }}',
                                text: '{{ PROBLEM }}',
                                icon: 'altname'
                            });
                        }

                        // Requires/Default config
                        if(currentBrowserObj.requires_config && currentBrowserObj.default_config && (currentBrowserObj.requires_config != currentBrowserObj.default_config)) {
                            cell.content += substitute(iconTemplate, {
                                title: '{{ PROBLEM }}',
                                text: '{{ PROBLEM }}',
                                icon: 'disabled'
                            });
                        }

                        // Protected
                        if(currentBrowserObj['protected']) {
                            cell.content += substitute(iconTemplate, {
                                title: '{{ PROBLEM }}',
                                text: '{{ PROBLEM }}',
                                icon: 'protected'
                            });
                        }

                        // Notes
                        if(currentBrowserObj.notes) {
                            cell.content += substitute(iconTemplate, {
                                title: '{{ PROBLEM }}',
                                text: '{{ PROBLEM }}',
                                icon: 'footnote'
                            });
                        }

                        cell.content += '</div>';

                    }


                    // History stuff goes here


                    // Determine support
                    log('current', currentBrowserObj);

                    // Just debug
                    //browserFeatureHistory.forEach(function(id) { log(findObjectByIdInArray(id, payload.linked.supports)); });
                }
                else {
                    cell.className = 'bc-supports-unknown';
                    cell.content += '?';
                }

                if(isDebug) {
                    cell.content += '<br><br><br><br><br><code class="debug-detail-alt" title="feature id">' + feature.id + '</code> <code class="debug-detail-alt2" title="browser id">' + browserId + '</code> <code class="debug-detail" title="result">' + browserFeatureHistory + '</code>';
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

    function substitute(str, object) {
        return str.replace((/\\?\{([^{}]+)\}/g), function(match, name) {
            if (match.charAt(0) == '\\') return match.slice(1);
            return (object[name] != null) ? object[name] : '';
        });
    }

    function log(data) {
        if(isDebug && console && console.log) {
            console.log.apply(console, arguments);
        }
        return data;
    }

};