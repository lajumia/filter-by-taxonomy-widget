jQuery(document).ready(function ($) {
     var selects = $('.filter-by-taxonomy-select, .filter-by-category-select');
 
	function initFilterDropdown() {
        selects.each(function () {
            var el = $(this);

            if (!el.hasClass('select2-hidden-accessible')) {
                var placeholder = el.data('placeholder') || 'Select option';

                el.select2({
                    placeholder: placeholder,
                    allowClear: true,
                    width: '100%',
                    dropdownParent: el.closest('.widget'),
                    minimumResultsForSearch: 0
                });
            }
        });
    }

    // Desktop: initialize immediately
    initFilterDropdown();

    // Mobile: initialize after offcanvas/filter button opens
    $(document).on('click', '.filter-button', function () {
        setTimeout(initFilterDropdown, 100);
    });

	function updateProducts(taxonomy, termSlug, termName, push = true) {
    if (!termSlug) {
        // Load default shop products
        $('.products').load(filterTaxonomy.shop_url + ' .products > *');

        // Reset breadcrumb to Home / Shop
        const breadcrumb = $('.woocommerce-breadcrumb');
        if (breadcrumb.length) {
            const links = breadcrumb.find('a');
            if (links.length >= 2) {
                const homeLink = links.eq(0).prop('outerHTML');
                const shopLink = links.eq(1).prop('outerHTML');
                breadcrumb.html(homeLink + ' <span class="divider">/</span> ' + shopLink);
            }
        }

        if (push) history.pushState({}, '', filterTaxonomy.shop_url);
        return;
    }

    const archiveUrl = '/' + taxonomy + '/' + termSlug + '/';

    $.ajax({
        url: archiveUrl,
        type: 'GET',
		beforeSend: function () {
			if ($('.products').length) {
				$('.products').block({
					message: null,
					overlayCSS: { background: '#fff', opacity: 0.6 }
				});
			} ;
		},
        success: function (response) {
            
            const html = $('<div>').html(response);
		
            if ($('.products').length) {
                const products = html.find('.products').html();
                $('.products').html(products);

                const pagination = html.find('.woocommerce-pagination');

                if (pagination.length) {

                    if ($('.woocommerce-pagination').length) {
                        $('.woocommerce-pagination').replaceWith(pagination);
                    } else {
                        $('.products').after(pagination);
                    }

                } else {

                    // Remove old pagination if new response doesn't have one
                    $('.woocommerce-pagination').remove();

                }
			} else{
				window.location.href = archiveUrl;
			}

            if (push) history.pushState({ taxonomy: taxonomy, term: termSlug }, '', archiveUrl);

            const breadcrumb = $('.woocommerce-breadcrumb');
            if (breadcrumb.length && termName) {
                const links = breadcrumb.find('a');
                if (links.length >= 2) {
                    const homeLink = links.eq(0).prop('outerHTML');
                    const shopLink = links.eq(1).prop('outerHTML');
                    breadcrumb.html(
                        homeLink +
                        ' <span class="divider">/</span> ' +
                        shopLink +
                        ' <span class="divider">/</span> ' +
                        taxonomy +
                        ' <span class="divider">/</span> ' +
                        termName
                    );
                }
            }
        },
        complete: function () {
            $('.products').unblock();
        }
    });
}




    // $(document).on('change', '.filter-by-taxonomy-select, .filter-by-category-select', function () {
    //     var termSlug = $(this).val();
    //     var taxonomy = $(this).data('taxonomy');
    //     var termName = $(this).find('option:selected').text().replace(/\s*\(\d+\)\s*$/, '');

    //     updateProducts(taxonomy, termSlug, termName, true);
    // });

    $(document).on('change', '.filter-by-taxonomy-select, .filter-by-category-select', function () {

        const termSlug = $(this).val();
        const taxonomy = $(this).data('taxonomy');

        if (!termSlug) {
            window.location.href = filterTaxonomy.shop_url;
            return;
        }

        const baseUrl = filterTaxonomy.shop_url.replace('/shop/', '/');

        window.location.href =
            baseUrl +
            taxonomy +
            '/' +
            termSlug +
            '/';

    });

    // $(document).on('click', '.woocommerce-pagination a', function (e) {

    //     e.preventDefault();

    //     const url = $(this).attr('href');

    //     $.ajax({
    //         url: url,
    //         type: 'GET',

    //         success: function (response) {

    //             const html = $('<div>').html(response);

    //             $('.products').html(
    //                 html.find('.products').html()
    //             );

    //             $('.woocommerce-pagination').replaceWith(
    //                 html.find('.woocommerce-pagination')
    //             );

    //             history.pushState({}, '', url);

    //         }
    //     });

    // });
	
	// Auto-select dropdown if on a taxonomy archive page
	const pathParts = window.location.pathname.split('/').filter(Boolean);

    if (pathParts.length >= 2) {

        const currentTaxonomy = pathParts[0];
        const currentTerm = pathParts[1];

        $('.filter-by-taxonomy-select, .filter-by-category-select').each(function () {

            const el = $(this);

            if (el.data('taxonomy') === currentTaxonomy) {

                el.val(currentTerm).trigger('change.select2');

            }

        });

    }


    // Handle back/forward navigation
    window.addEventListener('popstate', function (event) {
        const urlParams = new URLSearchParams(window.location.search);
        const termSlug = urlParams.values().next().value;
        $('.filter-by-taxonomy-select, .filter-by-category-select').each(function () {
            var el = $(this);
            var taxonomy = el.data('taxonomy');

            el.val(termSlug).trigger('change.select2');
            updateProducts(taxonomy, termSlug, false);
        });
        updateProducts(taxonomy, termSlug, false);
    });
});
