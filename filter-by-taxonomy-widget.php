<?php
/*
 * Plugin Name: Filter By Taxonomy Widget for WooCommerce
 * Description: Filter WooCommerce products by any taxonomy with AJAX and searchable dropdown in a widget.
 * Version: 1.0.0
 * Author: Md Laju Miah
 * Author URI: https://www.upwork.com/freelancers/~0149190c8d83bae2e2
 * License: GPLv2 or later
*/

if (!defined('ABSPATH')) exit;

class Filter_By_Taxonomy_Widget extends WP_Widget {

    public function __construct() {
        parent::__construct(
            'filter_by_taxonomy_widget',
            __('Filter By Taxonomy', 'filter-by-taxonomy-widget'),
            array('description' => __('Filter WooCommerce products by any taxonomy with AJAX', 'filter-by-taxonomy-widget'))
        );

        add_action('wp_enqueue_scripts', array($this, 'fbt_enqueue_scripts'));
    }

    public function fbt_enqueue_scripts() {
        if (!is_shop() && !is_product_taxonomy()) return;
    
        wp_enqueue_script('select2-js', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0', true);
        wp_enqueue_style('select2-css', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0');

         // Enqueue your custom script
        wp_enqueue_script(
            'filter-by-taxonomy',
            plugin_dir_url(__FILE__) . 'assets/js/select2.min.js',
            array('jquery'),
            '1.0',
            true
        );

        // Enqueue your select style
		wp_enqueue_style(
			'select2',
			plugin_dir_url(__FILE__) . 'assets/css/selecte2.min.css',
			'1.0',
			'all'
		);
    
        // Enqueue your custom script
        wp_enqueue_script(
            'filter-by-taxonomy',
            plugin_dir_url(__FILE__) . 'assets/js/filter-by-taxonomy.js',
            array('jquery', 'select2-js'),
            '1.0',
            true
        );
		
		// Enqueue your custom style
		wp_enqueue_style(
			'filter-by-taxonomy-style',
			plugin_dir_url(__FILE__) . 'assets/css/filter-by-taxonomy.css',
			'1.0',
			'all'
		);
    
        wp_localize_script('filter-by-taxonomy', 'filterTaxonomy', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'shop_url' => get_permalink(wc_get_page_id('shop')),
            'nonce' => wp_create_nonce('filter_taxonomy_nonce'),
        ));
    }
    


    public function widget($args, $instance) {
        $taxonomy = !empty($instance['taxonomy']) ? $instance['taxonomy'] : 'product_cat';

        $terms = get_terms(array(
            'taxonomy' => $taxonomy,
            'hide_empty' => true,
        ));

        echo $args['before_widget'];
        echo $args['before_title'] . apply_filters('widget_title', !empty($instance['title']) ? $instance['title'] : __('Filter By Taxonomy', 'filter-by-taxonomy-widget')) . $args['after_title'];

        if (!empty($terms) && !is_wp_error($terms)) {
            echo '<select id="filter-by-taxonomy-dropdown" class="filter-by-taxonomy-select" data-taxonomy="' . esc_attr($taxonomy) . '" style="width:100%">';
            echo '<option value="" style="font-size:13px">' . esc_html__('Select origin', 'filter-by-taxonomy-widget') . '</option>';
            foreach ($terms as $term) {
                echo '<option value="' . esc_attr( $term->slug ) . '">' .
					 esc_html( $term->name . ' (' . $term->count . ')' ) .
					 '</option>';
            }
            echo '</select>';
        } else {
            echo '<p>' . esc_html__('No origin found.', 'filter-by-taxonomy-widget') . '</p>';
        }

        echo $args['after_widget'];
    }

    public function form($instance) {
        $taxonomy = !empty($instance['taxonomy']) ? $instance['taxonomy'] : 'product_cat';
        $title = !empty($instance['title']) ? $instance['title'] : __('Filter By Taxonomy', 'filter-by-taxonomy-widget');

        $taxonomies = get_taxonomies(array('public' => true), 'objects');
        ?>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('title')); ?>"><?php esc_html_e('Title:', 'filter-by-taxonomy-widget'); ?></label>
            <input class="widefat" id="<?php echo esc_attr($this->get_field_id('title')); ?>"
                   name="<?php echo esc_attr($this->get_field_name('title')); ?>" type="text"
                   value="<?php echo esc_attr($title); ?>">
        </p>
        <p>
            <label for="<?php echo esc_attr($this->get_field_id('taxonomy')); ?>"><?php esc_html_e('Select Taxonomy:', 'filter-by-taxonomy-widget'); ?></label>
            <select class="widefat" id="<?php echo esc_attr($this->get_field_id('taxonomy')); ?>"
                    name="<?php echo esc_attr($this->get_field_name('taxonomy')); ?>">
                <?php foreach ($taxonomies as $tax) : ?>
                    <option value="<?php echo esc_attr($tax->name); ?>" <?php selected($taxonomy, $tax->name); ?>>
                        <?php echo esc_html($tax->labels->name); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </p>
        <?php
    }

    public function update($new_instance, $old_instance) {
        return array(
            'taxonomy' => (!empty($new_instance['taxonomy'])) ? sanitize_text_field($new_instance['taxonomy']) : 'product_cat',
            'title' => (!empty($new_instance['title'])) ? sanitize_text_field($new_instance['title']) : '',
        );
    }

    
}

function register_filter_by_taxonomy_widget() {
    register_widget('Filter_By_Taxonomy_Widget');
}
add_action('widgets_init', 'register_filter_by_taxonomy_widget');
