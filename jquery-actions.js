(function($) {

    var historyCount = 0;

    var $historyCloseButton = $('<button><abbr><span></span><i></i></abbr></button>')
                              .addClass('bc-history-button')
                              .find('abbr')
                                .addClass('only-icon')
                                .attr('title', 'Return to compatability table.') /* TODO: not #l10n friendly */
                                .end()
                              .find('span')
                                .append('Close')/* TODO: not #l10n friendly */
                              .end()
                              .find('i')
                                .addClass('icon-times')
                                .attr('aria-hidden', true)
                              .end();



    return jQuery.fn.mozCompatTable = function() {
        return $(this).each(function() {

            // Keep track of what may be open
            var $openCell;

            // If nothing provided, bail
            var $table = $(this);
            if(!$table.length) return;

            // Activate all history cells for keyboard;  TODO:  add "aria-controls"
            $table.find('.bc-has-history').each(function() {
                var historyId = 'bc-history-' + (++historyCount);
                var $td = $(this);

                $td.attr({
                    tabIndex: 0,
                    'aria-expanded': false,
                    'aria-controls': historyId
                });
                $td.find('.bc-history').attr('id', historyId);
            });

            $table.find('.bc-has-history').attr('tabindex', 0).attr('aria-expanded', false)//.attr('aria-controls', historyId);

            // Listen for clicks on "history" cells
            $table.on('click', '.bc-has-history', function() {
                closeAndOpenHistory($(this));
            });

            // Listen for clicks on "close" buttons
            $table.on('click', '.bc-history-button', hideHistory);

            // Listen for keys to open/close history
            $table.on('keypress', '.bc-has-history', function(ev) {
                var $td = $(this);
                var key = ev.which;

                if(key === 13 || key === 32) {
                    closeAndOpenHistory($td);
                    ev.preventDefault();
                } else if(key === 27) {
                    hideHistory();
                    ev.preventDefault();
                }
            });

            // Function which closes any open history, opens the target history
            function closeAndOpenHistory($td) {
                var previousOpenCell = $openCell && $openCell.get(0);

                // Close what's open, if anything
                hideHistory();

                // If they clicks the same cell (are closing), we can leave now
                if($td.get(0) == previousOpenCell) {
                    $openCell = false;
                    return;
                }

                // Set this cell as open
                $openCell = $td;

                // Show!
                showHistory();
            }


            // Opens the history for a given item
            function showHistory() {

                var $row = $openCell.closest('tr');
                var $history = $openCell.find('.bc-history').outerWidth($table.width() + 'px');

                // get cell coords
                var cellLeft = $openCell.offset().left;

                // get cell left border
                var cellLeftBorder = $openCell.css('border-left-width');

                // get table coords
                var tableLeft = $table.offset().left;

                // left coord of table minus left coord of cell
                var historyLeft = tableLeft - cellLeft - parseInt(cellLeftBorder, 10) - 1;


                // top
                // can't just to top:100% in CSS because IE messes it up.

                // get cell height
                var cellTop = $openCell.outerHeight();

                // get cell top border
                var celltopBorder = $openCell.css('border-top-width');

                // get cell bottom border
                var cellBottomBorder = $openCell.css('border-bottom-width');

                var historyTop = cellTop - parseInt(cellBottomBorder, 10) - parseInt(celltopBorder, 10);

                var historyHeight;
                var windowWidth;

                // move history where it will display
                $history.css({
                    left: historyLeft + 'px',
                    top: historyTop + 'px'
                });

                // measure height
                $history.css('display', 'block');
                $history.attr('aria-hidden', false);
                
                historyHeight = $history.outerHeight();

                // set max-height to 0 and visibility to visible
                $openCell.addClass('active');
                $openCell.attr('aria-expanded', true);
                $history.css('height', historyHeight + 'px');

                // add measured height to history and to the cell/row it is being displayed beneath (CSS handles transition)
                windowWidth = window.innerWidth;
                if(windowWidth > 801) {
                    $row.find('th, td').css('border-bottom', historyHeight + 'px solid transparent');
                } if(windowWidth > 481) {
                    $row.find('td').css('border-bottom', historyHeight + 'px solid transparent');
                } else {
                    $openCell.css('border-bottom', historyHeight + 'px solid transparent');
                }
                

            }

            // Hides the history dropdown for a given cell
            function hideHistory(){
                if(!$openCell) return;

                var $history;

                $openCell.css('border-bottom', '').attr('aria-expanded', false);
                $openCell.closest('tr').find('th, td').css('border-bottom', '');

                $history = $openCell.find('.bc-history');
                $history.css('height', '').attr('aria-hidden', true);

                // if the focus is inside the .bc-history and we'd lose our keyboard place, move focus to parent
                if($.contains($openCell.get(0), document.activeElement)) {
                    $openCell.focus();
                }

                $openCell.removeClass('active');
                $history.css('display', 'none');
            }
        });
    };

})(jQuery);