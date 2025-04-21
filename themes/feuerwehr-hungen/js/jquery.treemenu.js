/*
 treeMenu - jQuery plugin
 version: 0.6

 Copyright 2014 Stepan Krapivin

*/
(function($){
    $.fn.treemenu = function(options) {
        options = options || {};
        // Delay is no longer used for animation, but might be kept for other purposes or removed.
        // options.delay = options.delay || 0;
        options.openActive = options.openActive || false;
        options.closeOther = options.closeOther || false;
        options.activeSelector = options.activeSelector || ".active"; // Class for active item link

        // Check if this is the root call
        var isRoot = !options.nonroot;
        if (isRoot) {
            this.addClass("treemenu treemenu-root");
        } else {
            this.addClass("treemenu"); // Add class even to submenus if needed by styling
        }

        options.nonroot = true; // Mark subsequent calls as non-root

        this.find("> li").each(function() {
            var $li = $(this); // Use $ prefix for jQuery objects
            let $link = $li.children('a'); // Find the direct child anchor
            var $subtree = $li.children('ul'); // More specific selector for direct child UL

            // --- Add base class to the link ---
            $link.addClass('tree-link'); // Add .tree-link to all direct child links

            if ($subtree.length > 0) {
                // *** REMOVED: subtree.hide(); ***
                // Initial hiding is now handled by CSS via the .tree-closed class
                $li.addClass('has-submenu');        // Add .has-submenu to the LI
                $link.addClass('parent-link');      // Add .parent-link to the triggering A
                $subtree.addClass('submenu');         // Add .submenu to the child UL

                // --- Add classes to the items WITHIN the submenu ---
                $subtree.children('li').each(function() {
                    var $subLi = $(this);
                    $subLi.addClass('submenu-item'); // Add .submenu-item to each LI in the submenu
                    $subLi.children('a').addClass('submenu-link'); // Add .submenu-link to each A in the submenu item
                    // Note: The recursive call will also add 'tree-link' to these submenu links, which is fine.
                });

                // Ensure initial state class is present if not already set
                if (!$li.hasClass('tree-opened')) {
                    $li.addClass('tree-closed');
                }

                // Attach click handler ONLY to parent links
                $link.off('click.treemenu touchend.treemenu').on('click.treemenu touchend.treemenu', function(e) {
                    e.preventDefault(); // Prevent link navigation for parent items

                    var $currentLi = $(this).parent('li');

                    // Handle closing other open submenus
                    if (options.closeOther && $currentLi.hasClass('tree-closed')) {
                        var $siblings = $currentLi.siblings('.has-submenu'); // Target only siblings that have submenus

                        // Change classes, CSS handles the visual change
                        $siblings.removeClass("tree-opened").addClass("tree-closed");
                    }

                    // Toggle the current submenu's state via classes on the LI
                    $currentLi.toggleClass('tree-opened tree-closed');
                });

                // Recursively call treemenu on the subtree FOR DEEPER LEVELS (if any)
                // This ensures nested submenus (if they exist) also get processed
                $subtree.treemenu(options);

            } else {
                // --- Add class for items WITHOUT submenus ---
                $li.addClass('tree-empty');
            }
        });

        // Handle opening active items on load
        if (isRoot && options.openActive) { // Only run openActive on the root call
            var $activeLink = this.find(options.activeSelector).first(); // Find the first active link

            if ($activeLink.length) {
                // Navigate up from the active LINK to its containing LIs and ULs
                $activeLink.parentsUntil('.treemenu-root', 'li').each(function() {
                    var $parentLi = $(this);
                    // Check if this LI actually has a submenu before changing classes
                    if ($parentLi.children('ul').length > 0) {
                        // *** REPLACED: el.find('> ul').show(); el.show(); ***
                        $parentLi.removeClass('tree-closed').addClass('tree-opened');
                    }
                });
                // Ensure parent ULs are visible (handled by CSS, but good practice)
                // $activeLink.parentsUntil('.treemenu-root', 'ul').show(); // Probably not needed if CSS handles visibility
            }
        }

        return this;
    }
})(jQuery);

// --- How to initialize it ---
$(document).ready(function() {
    $('#tree-menu').treemenu({
        // openActive: true, // Set to true if you want the active item's parents opened on load
        closeOther: true, // Set to true to close other submenus when one is opened
        activeSelector: ".active" // Make sure your active links have this class
    });
});
