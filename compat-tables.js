/*

    TO DO
    ===============================

    1.  Display information within the legend

    2.  Add browser version feature detail within history dropdowns

*/

function loadTable(payload, locale) {

    var langDictionary = {
        en: {
            // Browser Types
            browserTypes: {
                desktop: 'Desktop',
                mobile: 'Mobile'
            },

            // Basic yes and no
            supportsShort: {
                yes: 'Yes',
                no: 'No',
                parital: 'Partial'
            },

            // Support levels
            supportsLong: {
                yes: 'Full support',
                no: 'No support',
                partial: 'Partial support'
            },

            // Features, used in the left-most column
            features: {
                experimental: 'Experimental',
                experimentalLong: 'Experimental. Expect behavior to change in the future.',

                nonstandard: 'Non-standard',
                nonstandardLong: 'Non-standard. Expect poor cross-browser support.',

                obsolete: 'Obsolete',
                obsoleteLong: 'Obsolete. Not for use in new websites.'
            },
            
            // Version requirements
            requirements: {
                prefix: 'Prefixed',
                prefixLong: 'Requires the vendor prefix: {prefix}',

                notes: 'Notes',
                notesLong: 'See implementation notes',

                alternate: 'Alternate Name',
                alternateLong: 'Uses the non-standard name: {name}',

                'protected': 'Protected',
                protectedLong: 'Protected. Additonal steps are required to get permission or certification for use.',

                disabled: 'Disabled',
                disabledRequires: 'The user must change {default} to {requires} to enable this feature.',
                disabledDefault: 'The user must change {default} to enable this feature.'
            },

            // Legend text
            legend: {
                heading: 'Legend'
            }
        }
    };


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

    // Conditions object so we know what to put into the legend
    var legendConditions = {
        // Support levels
        yes: false,
        partial: false,
        no: false,
        
        // Individual browser support details
        prefix: false,
        alternate: false,
        'protected': false,
        notes: false,
        config: false,

        // Feature detail
        experimental: false,
        nonstandard: false,
        obsolete: false
    };

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
        if(feature.experimental || feature.standardized === false || feature.obsolete) {
            output += '<div class="bc-icons">';

            if(feature.experimental) {
                output += getExperimentalIcon();
                setLegendCondition('experimental');
            }
            if(feature.standardized === false) {
                output += getNonStandardIcon();
                setLegendCondition('nonstandard');
            }
            if(feature.obsolete) {
                output += getObsoleteIcon();
                setLegendCondition('obsolute');
            }
            output += '</div>';
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
                    // Only remove this item from the browser array if it doesn't fit icon/special criteria
                    currentBrowserObj = findObjectByIdInArray(browserFeatureHistory[browserFeatureHistory.length - 1], payload.linked.supports);
                    if(!meetsIconCritera(currentBrowserObj)) {
                        browserFeatureHistory.pop()
                    }

                    // Determine support via classname
                    cell.classes.push('bc-supports-' + currentBrowserObj.support);

                    // Build up the content 
                    // This is going to need a ton of logic 
                    browserVersionObj = findObjectByIdInArray(currentBrowserObj.links.version, payload.linked.versions);

                    // Add "Yes", "No", "Partial" or {version}
                    cell.content += getBrowserSupportText(browserVersionObj, currentBrowserObj);
                    setLegendCondition(currentBrowserObj.support);

                    cell.content += substitute(supportTemplate, {
                        title: getStringBasedOnLocale('supportsLong', currentBrowserObj.support),
                        icon: currentBrowserObj.support,
                        text: getStringBasedOnLocale('supportsLong', currentBrowserObj.support)
                    });

                    // Add icons for this individual history object
                    cell.content += outputIconsForHistoryObject(currentBrowserObj);

                    // History stuff goes here
                    // The "latest" browser was pop()'d off, so all items in this array are histroy/older
                    if(browserFeatureHistory.length) {

                        // Add dropdown toggle
                        cell.content += '<a href="' + (feature.mdn_uri || 'javascript:;') + '" title="{{ PROBLEM }}" class="bc-history-link only-icon"><span>{{ PROBLEM }}</span><i class="ic-history" aria-hidden="true"></i></a>';

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

                            // Add text for the version/support box
                            cell.content += getBrowserSupportText(historyItemVersionObject, historyItemObject);

                            cell.content += outputIconsForHistoryObject(historyItemVersionObject);
                            cell.content += '</dt>';

                            cell.content += '<dd>&nbsp;</dd>';

                            setLegendCondition(historyItemObject.support);
                        });
                        cell.content += '</dl></section>';
                    }
                }
                else {
                    cell.classes.push('bc-supports-unknown');
                    cell.content += '?';
                }

                // Provide the browser class regardless of support
                cell.classes.push('bc-browser-' + browserMeta.slug);

                output += '<td class="' + cell.classes.join(' ') + '"> ' + cell.content + '</td>';

            });
        });

        output += '</tr>';
    });

    output += '</tbody>';

    // Table close
    output += '</table>';

    
    // LEGEND, IF NECESSARY
    // ===============================
    output += '<section class="bc-legend">';
    output += '<h3 class="offscreen">' + getStringBasedOnLocale('legend', 'heading') + '</h3>';

    output += '</section>';

    return output;




    // UTILITY FUNCTIONS
    // ===============================

    // Simple true/false logic determining if a browser history object meets "extra info" criteria
    function meetsIconCritera(historyObject) {
        return (historyObject.prefix_mandatory || 
            historyObject.alternate_name_mandatory || 
            historyObject['protected'] || 
            historyObject.notes ||
            (historyObject.requires_config && historyObject.default_config && (historyObject.requires_config != historyObject.default_config))
        );
    }

    // Evaluate a browser history object, place icons as needed
    function outputIconsForHistoryObject(historyObject) {
        var output = '';

        // Account for any required icons
        if(meetsIconCritera(historyObject)) {

            output += '<div class="bc-icons">';

            // Browser Prefix
            if(historyObject.prefix_mandatory) {
                output += getPrefixIcon(historyObject);
                setLegendCondition('prefix');
            }

            // Alternate Name Mandatory
            if(historyObject.alternate_name_mandatory) {
                output += getAlternateIcon(historyObject);
                setLegendCondition('alternate');
            }

            // Requires/Default config
            if(historyObject.requires_config && historyObject.default_config && (historyObject.requires_config != historyObject.default_config)) {
                output += getConfigIcon(historyObject);
                setLegendCondition('config');
            }

            // Protected
            if(historyObject['protected']) {
                output += getProtectedIcon();
                setLegendCondition('protected');
            }

            // Notes
            if(historyObject.notes) {
                output += getNotesIcon();
                setLegendCondition('notes');
            }

            output += '</div>';
        }

        return output;
    }

    // Set a legend condition key
    function setLegendCondition(key) {
        legendConditions[key] = true;
    }

    // Returns either the browser version number or "Yes" / "No" / "Partial"  for support text blocks
    function getBrowserSupportText(versionObj, browserObj) {
        if(versionObj && versionObj.version) {
            return versionObj.version;
        }
        else {
            return getStringBasedOnLocale('supportsShort', browserObj.support); // PROBLEM:  This requires localization for "Yes" and "No"
        }
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

    // Finds a string in the dictionary for the given language object
    // TODO:  Accomodate for more locales
    function getStringBasedOnLocale(langDictKey, stringKey, obj) {
        return substitute(langDictionary['en'][langDictKey][stringKey], obj || {}) || '[UNKNOWN]';
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

    // ICON BUILDERS
    // ===============================
    function _getBasicIcon(langKey, longTextKey, shortTextKey, icon) {
        return substitute(iconTemplate, {
                    title: getStringBasedOnLocale(langKey, longTextKey),
                    text: getStringBasedOnLocale(langKey, shortTextKey),
                    icon: (icon || shortTextKey)
                });
    }

    function getExperimentalIcon() {
        return _getBasicIcon('features', 'experimentalLong', 'experimental');
    }

    function getNonStandardIcon() {
        return _getBasicIcon('features', 'nonstandardLong', 'nonstandard', 'non-standard');
    }

    function getObsoleteIcon() {
        return _getBasicIcon('features', 'obsoleteLong', 'obsolete');
    }

    function getProtectedIcon() {
        return _getBasicIcon('requirements', 'protectedLong', 'protected');
    }

    function getNotesIcon() {
        return _getBasicIcon('requirements', 'notesLong', 'notes', 'footnote');
    }

    function getConfigIcon(historyObject) {
        return substitute(iconTemplate, {
                    title: getStringBasedOnLocale('requirements', (historyObject.requires_config && historyObject.default_config) ? 'disabledRequires' : 'disabledDefault', {
                        'default': historyObject.default_config,
                        'requires': historyObject.requires_config
                    }),
                    text: getStringBasedOnLocale('requirements', 'disabled'),
                    icon: 'disabled'
                });
    }

    function getAlternateIcon(historyObject) {
        return substitute(iconTemplate, {
                    title: getStringBasedOnLocale('requirements', 'alternateLong', {
                        prefix: historyObject.alternate_name
                    }),
                    text: getStringBasedOnLocale('requirements', 'alternate'),
                    icon: 'altname'
                });
    }

    function getPrefixIcon(historyObject) {
        return substitute(iconTemplate, {
                    title: getStringBasedOnLocale('requirements', 'prefixLong', {
                        prefix: historyObject.prefix
                    }),
                    text: getStringBasedOnLocale('requirements', 'prefix'),
                    icon: 'prefix'
                });
    }

};



