/*

    TO DO
    ===============================

    1.  Security check:
            -  Anything coming straight from DB needs to be encoded since this is a open source project
               (anyone can cause a problem)

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
    var supportTemplate = '<abbr title="{title}" class="bc-level bc-level-{icon} only-icon"><span>{text}</span><img src="support-sprite.gif" aria-hidden="true"></abbr>';

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

        var tabName = getLocaleOrDefaultFromObject(tab.name);
        output += substitute(iconTemplate, {
            title: '{{ PROBLEM }}', // PROBLEM:  No way to identify "Desktop" or "Mobile" for the title
            text: tabName,
            icon: '{{ PROBLEM }}' // PROBLEM:  No way to identify "ic-{x}" (desktop|mobile) for class
        });

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

            output += '<th class="bc-browser-' + slugForCss + '">';

            output += substitute(iconTemplate, {
                title: browserName,
                text: browserName, // PROBLEM:  No way of knowing "for Desktop" (localization issue)
                icon: slugForCss
            });

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
                var browserMeta = findObjectByIdInArray(browserId, payload.linked.browsers);
                var currentBrowserObj;
                var browserVersionObj;

                var cell = {
                    classes: [],
                    content: ''
                };

                log(feature.id, '|', browserId, '|', browserFeatureHistory);

                if(browserFeatureHistory) {

                    // Assume the last item is the "current"
                    // This will likely need to change in the future
                    currentBrowserObj = findObjectByIdInArray(browserFeatureHistory.pop(), payload.linked.supports);

                    // Determine support via classname
                    cell.classes.push('bc-supports-' + currentBrowserObj.support);

                    // Build up the content 
                    // This is going to need a ton of logic 
                    browserVersionObj = findObjectByIdInArray(currentBrowserObj.links.version, payload.linked.versions);

                    if(browserVersionObj && browserVersionObj.version) {
                        cell.content += browserVersionObj.version;
                    }
                    else {
                        cell.content += '(' + currentBrowserObj.support + ')'; // PROBLEM:  This requires localization for "Yes" and "No"
                    }

                    cell.content += substitute(supportTemplate, {
                        title: '{{ PROBLEM }}',
                        icon: currentBrowserObj.support,
                        text: '{{ PROBLEM }}'
                    });

                    // Add icons for this individual history object
                    cell.content += outputIconsForHistoryObject(currentBrowserObj);

                    // History stuff goes here
                    // The "latest" browser was pop()'d off, so all items in this array are histroy/older
                    if(browserFeatureHistory.length) {
                        // Add dropdown toggle
                        cell.content += '<a href="{{ PROBLEM }}" title="{{ PROBLEM }}" class="bc-history-link only-icon"><span>{{ PROBLEM }}</span><i class="ic-history" aria-hidden="true"></i></a>';

                        // Setup the section
                        cell.content += '<section class="bc-history hidden" aria-hidden="true"><dl>';

                        // Reverse the array to show support newest -> oldest
                        browserFeatureHistory.reverse();
                        browserFeatureHistory.forEach(function(historyItemId) {
                            var historyItemObject = findObjectByIdInArray(historyItemId, payload.linked.supports);
                            var historyItemVersionObject = findObjectByIdInArray(historyItemObject.links.version, payload.linked.versions)

                            cell.content += '<dt class="bc-supports-' + historyItemObject.support +' bc-supports">';
                            cell.content += substitute(supportTemplate, {
                                title: '{{ PROBLEM }}',
                                text: '{{ PROBLEM }}',
                                icon: historyItemObject.support
                            });
                            cell.content += historyItemVersionObject.version;
                            cell.content += outputIconsForHistoryObject(historyItemVersionObject);
                            cell.content += '</dt>';

                            cell.content += '<dd>(maybe some information here?)</dd>';
                        });
                        cell.content += '</dl></section>';
                    }
                }
                else {
                    cell.classes.push('bc-supports-unknown');
                    cell.content += '?';
                }

                if(isDebug) {
                    cell.content += '<br><br><br><br><br><code class="debug-detail-alt" title="feature id">' + feature.id + '</code> <code class="debug-detail-alt2" title="browser id">' + browserId + '</code> <code class="debug-detail" title="result">' + browserFeatureHistory + '</code>';
                }

                // Provide the browser class regardless of support
                cell.classes.push('bc-browser-' + browserMeta.slug);

                output += '<td class="' + cell.classes.join(' ') + '"> ' + cell.content + '</td>';

            });
        });

        output += '</tr>';
    });
        
        /* SOME TYPEOF LOOP HERE */
        payload.linked.supports; // Supports array; need to connect to browsers

    output += '</tbody>';

    // Table close
    output += '</table>';

    
    // LEGEND, IF NECESSARY
    // ===============================
    output += '<section class="bc-legend">';

    output += '</section>';


    log('---------------------/' + payload.features.name.en + '---------------------');

    return output;




    // UTILITY FUNCTIONS
    // ===============================

    // Evaluate a browser history object, place icons as needed
    function outputIconsForHistoryObject(historyObject) {
        var output = '';
        
        // Account for any required icons
        if( historyObject.prefix_mandatory || 
            historyObject.alternate_name_mandatory || 
            historyObject['protected'] || 
            historyObject.notes ||
            (historyObject.requires_config && historyObject.default_config && (historyObject.requires_config != historyObject.default_config))
        ) {

            output += '<div class="bc-icons">';

            // Browser Prefix
            if(historyObject.prefix_mandatory) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'prefix'
                });
            }

            // Alternate Name Mandatory
            if(historyObject.alternate_name_mandatory) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'altname'
                });
            }

            // Requires/Default config
            if(historyObject.requires_config && historyObject.default_config && (historyObject.requires_config != historyObject.default_config)) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'disabled'
                });
            }

            // Protected
            if(historyObject['protected']) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'protected'
                });
            }

            // Notes
            if(historyObject.notes) {
                output += substitute(iconTemplate, {
                    title: '{{ PROBLEM }}',
                    text: '{{ PROBLEM }}',
                    icon: 'footnote'
                });
            }

            output += '</div>';
        }

        return output;
    }

    // Returns the total number of browsers, both desktop and mobile
    function getNumberOfBrowsers() {
        var numBrowsers = 0;

        tabs.forEach(function(tab) {
            numBrowsers += tab.browsers.length;
        });

        return numBrowsers;
    }

    // Tries to find the locale string for a given name object based on the navigator locale
    function getLocaleOrDefaultFromObject(nameObject) {
        return typeof nameObject === 'string' ? nameObject : (nameObject[locale] || nameObject[locale.split('-')[0]] || nameObject['en']);
    }

    // Given an array of objects, this finds the desired object based on provided ID
    function findObjectByIdInArray(id, array) {
        var match;
        array.forEach(function(obj) {
            if(match) return;
            if(obj.id === id) match = obj;
        });
        return match;
    }

    // Substitutes { key: value } objects into a template string
    // Example:  <abbr title="{title}" class="only-icon">    { title: 'Something' }
    function substitute(str, object) {
        return str.replace((/\\?\{([^{}]+)\}/g), function(match, name) {
            if (match.charAt(0) == '\\') return match.slice(1);
            return (object[name] != null) ? object[name] : '';
        });
    }

    // Wrapper for logging, only logs when isDebug = true
    function log(data) {
        if(isDebug && console && console.log) {
            console.log.apply(console, arguments);
        }
        return data;
    }

};