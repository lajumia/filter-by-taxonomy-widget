jQuery(document).ready(function ($) {
    var select = $('#filter-by-taxonomy-dropdown');

    select.select2({
        placeholder: 'Select origin',
        allowClear: true,
        width: 'resolve'
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
            $('.products').block({
                message: null,
                overlayCSS: { background: '#fff', opacity: 0.6 }
            });
        },
        success: function (response) {
            const html = $('<div>').html(response);
            const products = html.find('.products').html();

            $('.products').html(products);
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




    select.on('change', function () {
        var termSlug = $(this).val();
        var taxonomy = $(this).data('taxonomy');
		var termName = $(this).find('option:selected').text().replace(/\s*\(\d+\)\s*$/, '');
        updateProducts(taxonomy, termSlug,termName, true);
    });
	
	// Auto-select dropdown if on a taxonomy archive page
	const pathParts = window.location.pathname.split('/').filter(Boolean);

	if (pathParts.length === 2) {
		const currentTaxonomy = pathParts[0]; // e.g., 'origin'
		const currentTerm = pathParts[1];     // e.g., 'Bangladesh'

		const dropdown = $('#filter-by-taxonomy-dropdown');

		if (dropdown.data('taxonomy') === currentTaxonomy) {
			dropdown.val(currentTerm).trigger('change.select2');
		}
	}


    // Handle back/forward navigation
    window.addEventListener('popstate', function (event) {
        const urlParams = new URLSearchParams(window.location.search);
        const termSlug = urlParams.values().next().value;
        const taxonomy = $('#filter-by-taxonomy-dropdown').data('taxonomy');

        $('#filter-by-taxonomy-dropdown').val(termSlug).trigger('change.select2');
        updateProducts(taxonomy, termSlug, false);
    });
});