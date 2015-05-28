/*

    TO DO
    ===============================

    1.  Update "requires_config" logic -- it's wrong;
            -  Fix in legend
            -  Fix in history

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
                prefixLong: 'Requires the vendor prefix: <code>{prefix}</code>',

                note: 'Notes',
                noteLong: 'See implementation notes',

                alternate: 'Alternate Name',
                alternateLong: 'Uses the non-standard name: <code>{name}</code>',

                'protected': 'Protected',
                protectedLong: 'Protected. Additonal steps are required to get permission or certification for use.',

                disabled: 'Disabled',
                disabledRequires: 'The user must change {default} to {requires} to enable this feature.',
                disabledDefault: 'The user must change {default} to enable this feature.'
            },

            // Legend text
            legend: {
                heading: 'Legend',
                prefixLong: 'Requires a vendor prefix or different name for use.',
                alternateLong: 'Uses a non-standard name.'
            }
        }
    };


    // Payload Shortcuts
    var tabs = payload.meta.compat_table.tabs;

    // Important Vars
    var numberOfBrowsers = getNumberOfBrowsers();

    // This is ultimately returned from the function
    var output = '';

    // Templates
    var templates = {
        icon: '<abbr title="{title}" class="only-icon"><span>{text}</span><i class="ic-{icon}" aria-hidden="true"></i></abbr>',
        mobile: '<abbr title="{title}" class="only-icon"><span>{text}</span><i class="ic-{icon1}" aria-hidden="true"></i> <i class="ic-{icon2}" aria-hidden="true"></i></abbr>',
        support: '<abbr title="{title}" class="bc-level bc-level-{icon} only-icon"><span>{text}</span><img src="support-sprite.gif" aria-hidden="true"></abbr>',
        legendItem: '<dt>{icon}</dt><dd>{text}</dd>'
    };
    templates.historySupport = templates.icon + ' {title}';

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
        note: false,
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

        output += _hackTableHeading(tab);

    });
    output += '</tr>';

    output += '<tr class="bc-browsers">';
    output += '<td></td>';
    tabs.forEach(function(tab) {
        tab.browsers.forEach(function(browserId) {
            output += _hackBrowserIcons(browserId);
        });
    });
    output += '</tr>';

    output += '</thead>';

    // BODY
    // ===============================
    output += '<tbody>';
    payload.linked.features.forEach(function(feature) {

        var name = getLocaleOrDefaultFromObject(feature.name);

        output += '<tr>';
        output += '<th scope="row">';
        if(feature.canonical) {
            output += '<code>' + name + '</code>';
        }
        else {
            output += name;
        }

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

                if(browserFeatureHistory) {

                    // Assume the last item is the "current"
                    // This will likely need to change in the future
                    currentBrowserObj = findObjectByIdInArray(browserFeatureHistory[browserFeatureHistory.length - 1], payload.linked.supports);

                    // Determine support via classname
                    cell.classes.push('bc-supports-' + currentBrowserObj.support);

                    // Build up the content 
                    // This is going to need a ton of logic 
                    browserVersionObj = findObjectByIdInArray(currentBrowserObj.links.version, payload.linked.versions);

                    // Add "Yes", "No", "Partial" or {version}
                    cell.content += getBrowserSupportText(browserVersionObj, currentBrowserObj);
                    cell.content += getSupportIcon(currentBrowserObj);

                    setLegendCondition(currentBrowserObj.support);

                    // Add icons for this individual history object
                    cell.content += outputIconsForHistoryObject(currentBrowserObj);

                    // History stuff goes here
                    // The "latest" browser was pop()'d off, so all items in this array are histroy/older
                    if(browserFeatureHistory.length > 1) {

                        cell.classes.push('bc-has-history');

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

                            cell.content += getSupportIcon(historyItemObject);

                            // Add text for the version/support box
                            cell.content += getBrowserSupportText(historyItemVersionObject, historyItemObject);
                            cell.content += outputIconsForHistoryObject(historyItemObject);
                            
                            cell.content += '</dt>';

                            cell.content += '<dd>' + outputDetailsForHistoryObject(historyItemObject) + '</dd>';

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

    
    // LEGEND
    // ===============================
    output += '<section class="bc-legend">';
    output += '<h3 class="offscreen">' + getStringBasedOnLocale('legend', 'heading') + '</h3>';
    output += '<dl>' + outputLegend() + '</dl>';
    output += '</section>';

    // Done!
    return output;




    // UTILITY FUNCTIONS
    // ===============================

    // Simple true/false logic determining if a browser history object meets "extra info" criteria
    function meetsIconCriteria(historyObject) {
        return (historyObject.prefix_mandatory || 
            historyObject.alternate_name_mandatory || 
            historyObject['protected'] || 
            historyObject.note ||
            meetsConfigCriteria(historyObject)
        );
    }

    function meetsConfigCriteria(historyObject) {
        historyObject.requires_config > 0 && historyObject.default_config != historyObject.requires_config;
    }

    // Evaluate a browser history object, place icons as needed
    function outputIconsForHistoryObject(historyObject) {
        var output = '';

        // Account for any required icons
        if(meetsIconCriteria(historyObject)) {

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
            if(meetsConfigCriteria(historyObject)) {
                output += getConfigIcon(historyObject);
                setLegendCondition('config');
            }

            // Protected
            if(historyObject['protected']) {
                output += getProtectedIcon();
                setLegendCondition('protected');
            }

            // Notes
            if(historyObject.note) {
                output += getNoteIcon();
                setLegendCondition('note');
            }

            output += '</div>';
        }

        return output;
    }


    // Evaluate a browser history object, place icons and detail text as needed
    function outputDetailsForHistoryObject(historyObject) {
        var output = '';

        // Account for any required icons
        if(meetsIconCriteria(historyObject)) {

            // Browser Prefix
            if(historyObject.prefix_mandatory) {
                output += getPrefixIcon(historyObject) + ' ' + getPrefixText(historyObject) + '<br>';
            }

            // Alternate Name Mandatory
            if(historyObject.alternate_name_mandatory) {
                output += getAlternateIcon(historyObject) + ' ' + getAlternateText(historyObject) + '<br>';
            }

            // Requires/Default config
            if(meetsConfigCriteria(historyObject)) {
                output += getConfigIcon(historyObject) + ' ' + getConfigText(historyObject) + '<br>';
            }

            // Protected
            if(historyObject['protected']) {
                output += getProtectedIcon() + 'FIX ME :: PROTECTED';
            }

            // Notes
            if(historyObject.note) {
                output += getNoteIcon() + getLocaleOrDefaultFromObject(historyObject.note) + '<br>';
            }

        }

        return output;
    }

    // Outputs line items 
    function outputLegend() {
        var output = '';

        // Basic supports
        ['yes', 'partial', 'no'].forEach(function(key) {
            if(legendConditions[key]) {
                output += getLegendHTML('<span class="bc-supports-' + key + ' bc-supports">' + getSupportIcon({ support: key }) + '&nbsp;</span>', getStringBasedOnLocale('supportsLong', key));
            }
        });

        // Browser support details
        if(legendConditions.prefix) {
            output += getLegendHTML(getPrefixIcon(), getStringBasedOnLocale('legend', 'prefixLong'));
        }
        if(legendConditions.alternate) {
            output += getLegendHTML(getAlternateIcon(), getAlternateText());
        }
        if(legendConditions['protected']) {
            output += getLegendHTML(getProtectedIcon(), getStringBasedOnLocale('requirements', 'protectedLong'));
        }
        if(legendConditions.note) {
            output += getLegendHTML(getNoteIcon(), getStringBasedOnLocale('requirements', 'noteLong'));
        }
        if(legendConditions.config) { // FIX ME
            output += getLegendHTML(getConfigIcon(), getConfigText());
        }

        // Feature details
        if(legendConditions.experimental) {
            output += getLegendHTML(getExperimentalIcon(), getStringBasedOnLocale('features', 'experimentalLong'));
        }
        if(legendConditions.nonstandard) {
            output += getLegendHTML(getNonStandardIcon(), getStringBasedOnLocale('features', 'nonstandardLong'));
        }
        if(legendConditions.obsolete) {
            output += getLegendHTML(getObsoleteIcon(), getStringBasedOnLocale('features', 'obsoleteLong'));
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
        return substitute(templates.icon, {
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

    function getNoteIcon() {
        return _getBasicIcon('requirements', 'noteLong', 'note', 'footnote');
    }

    function getConfigIcon(historyObject) {
        return substitute(templates.icon, {
                    title: getConfigText(historyObject),
                    text: getStringBasedOnLocale('requirements', 'disabled'),
                    icon: 'disabled'
                });
    }
    function getConfigText(historyObject) {
        return getStringBasedOnLocale('requirements', (historyObject.requires_config && historyObject.default_config) ? 'disabledRequires' : 'disabledDefault', {
                        'default': historyObject.default_config,
                        'requires': historyObject.requires_config
                    });
    }

    function getAlternateIcon(historyObject) {
        return substitute(templates.icon, {
                    title: getAlternateText(historyObject),
                    text: getStringBasedOnLocale('requirements', 'alternate'),
                    icon: 'altname'
                });
    }
    function getAlternateText(historyObject) {
        if(historyObject) {
            return getStringBasedOnLocale('requirements', 'alternateLong', {
                            prefix: historyObject ? historyObject.alternate_name : ''
                        });
        }
        else {
            return getStringBasedOnLocale('legend', 'alternateLong');
        }
        
    }

    function getPrefixIcon(historyObject) {
        return substitute(templates.icon, {
                    title: getPrefixText(historyObject),
                    text: getStringBasedOnLocale('requirements', 'prefix'),
                    icon: 'prefix'
                });
    }
    function getPrefixText(historyObject) {
        return getStringBasedOnLocale('requirements', 'prefixLong', {
                        prefix: historyObject ? historyObject.prefix : ''
                    });
    }

    function getSupportIcon(browserObj) {
        return substitute(templates.support, {
                        title: getStringBasedOnLocale('supportsLong', browserObj.support),
                        icon: browserObj.support,
                        text: getStringBasedOnLocale('supportsLong', browserObj.support)
                    });
    }

    function getLegendHTML(icon, text) {
        return substitute(templates.legendItem, {
            icon: icon,
            text: text
        });
    }



    // HACKS
    // ===============================
    // This section includes temporary hacks to make icons and such display properly

    function _hackTableHeading(tab) {
        var output = '';
        var tabName = getLocaleOrDefaultFromObject(tab.name);

        // Hacky vars
        var tabIcon = (tab.name.en.toLowerCase().indexOf('desktop') != -1 ? 'desktop' : 'mobile');

        output += '<th colspan="' + tab.browsers.length +'" class="bc-medium-' + tabIcon + '">';

        output += substitute(templates.icon, {
            title: tabName,
            text: tabName,
            icon: tabIcon
        });

        output += '</th>';

        return output;
    }

    function _hackBrowserIcons(browserId) {
        var output = '';
        var matchedBrowserObj = findObjectByIdInArray(browserId, payload.linked.browsers);
        var browserName = getLocaleOrDefaultFromObject(matchedBrowserObj.name);
        var icon = matchedBrowserObj.slug;
        var template = templates.icon;
        var substituteObject = {
            title: browserName,
            text: browserName, // PROBLEM:  No way of knowing "for Desktop" (localization issue)
            icon: icon
        };

        if(icon == 'firefox_mobile') {
            template = templates.mobile;
            substituteObject.icon1 = 'firefox';
            substituteObject.icon2 = 'android';
        }
        else if(icon == 'opera_mobile') {
            template = templates.mobile;
            substituteObject.icon1 = 'opera';
            substituteObject.icon2 = 'mobile';
        }
        else if(icon == 'android') {
            template = templates.mobile;
            substituteObject.icon1 = 'chrome';
            substituteObject.icon2 = 'mobile';
        }

        output += '<th class="bc-browser-' + icon + '">';

        output += substitute(template, substituteObject);

        output += '</th>';

        return output;
    }

}
